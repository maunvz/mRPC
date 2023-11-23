package com.nvz.mrpc;

import java.io.IOException;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.google.protobuf.Message;
import com.google.protobuf.RpcCallback;
import com.google.protobuf.RpcChannel;
import com.google.protobuf.RpcController;
import com.google.protobuf.Service;

import java.lang.reflect.Method;

import io.socket.client.Ack;
import io.socket.client.Socket;
import io.socket.engineio.server.EngineIoServer;
import io.socket.engineio.server.EngineIoServerOptions;
import io.socket.socketio.server.SocketIoNamespace;
import io.socket.socketio.server.SocketIoServer;
import io.socket.socketio.server.SocketIoSocket;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.eclipse.jetty.server.Server;
import org.eclipse.jetty.servlet.ServletHandler;

public class RpcUtils {
    private static final String TAG = "RpcUtils";
    private static final Logger logger = Logger.getLogger(TAG);

    // Not thread safe, must be called within a locked context
    private static String latestSocketId = "";
    public static String getCurrentSocketIdLocked() {
        return latestSocketId;
    }

    private static final RpcController controller = new RpcController() {
        @Override
        public void reset() {

        }

        @Override
        public boolean failed() {
            return false;
        }

        @Override
        public String errorText() {
            return null;
        }

        @Override
        public void startCancel() {

        }

        @Override
        public void setFailed(String reason) {

        }

        @Override
        public boolean isCanceled() {
            return false;
        }

        @Override
        public void notifyOnCancel(RpcCallback<Object> callback) {

        }
    };

    public static RpcController getDefaultController() {
        return controller;
    }

    public static void wrapSocket(Socket socket, Service impl) {
        impl.getDescriptorForType().getMethods().forEach(method -> {
            socket.on(impl.getDescriptorForType().getFullName()+"+"+method.getName(), (args) -> {
                try {
                    Class<?> clazz = Class.forName(method.getInputType().getFullName());
                    Method parseMethod = clazz.getDeclaredMethod("parseFrom", byte[].class);
                    Message request = (Message) parseMethod.invoke(null, (byte[]) args[0]);
                    synchronized(impl) {
                        latestSocketId = socket.id();
                        impl.callMethod(method, controller, request, (response) -> {
                            ((Ack) args[1]).call(response.toByteArray());
                        });
                        latestSocketId = "";
                    }
                } catch (Exception e) {
                    logger.log(Level.WARNING, "Failed to parse", e);
                }
            });
        });
    }

    // Same as above, but with server socket type
    public static void wrapSocket(SocketIoSocket socket, Service impl) {
        impl.getDescriptorForType().getMethods().forEach(method -> {
            socket.on(impl.getDescriptorForType().getFullName()+"+"+method.getName(), (args) -> {
                try {
                    Class<?> clazz = Class.forName(method.getInputType().getFullName());
                    Method parseMethod = clazz.getDeclaredMethod("parseFrom", byte[].class);
                    Message request = (Message) parseMethod.invoke(null, (byte[]) args[0]);
                    synchronized (impl) {
                        latestSocketId = socket.getId();
                        impl.callMethod(method, controller, request, (response) -> {
                            ((SocketIoSocket.ReceivedByLocalAcknowledgementCallback) args[1]).sendAcknowledgement(response.toByteArray());
                        });
                        latestSocketId = "";
                    }
                } catch (Exception e) {
                    logger.log(Level.WARNING, "Failed to parse", e);
                }
            });
        });
    }

    public static RpcChannel makeChannel(Socket socket) {
        return (method, controller, request, responsePrototype, done) -> {
            socket.emit(
                    method.getService().getFullName()+"+"+method.getName(),
                    new Object[]{request.toByteArray()},
                    (ack) -> {
                        try {
                            Class<?> clazz = Class.forName(method.getOutputType().getFullName());
                            Method parseMethod = clazz.getDeclaredMethod("parseFrom", byte[].class);
                            Message reply = (Message) parseMethod.invoke(null, (byte[]) ack[0]);
                            done.run(reply);
                        } catch (Exception e) { // Handles various Reflection and ProtoBuf exceptions
                            logger.log(Level.WARNING, "Failed to parse", e);
                        }
                    });
        };
    }

    public static RpcChannel makeChannel(SocketIoSocket socket) {
        return (method, controller, request, responsePrototype, done) -> {
            socket.send(
                    method.getService().getFullName()+"+"+method.getName(),
                    new Object[]{request.toByteArray()},
                    (ack) -> {
                        try {
                            Class<?> clazz = Class.forName(method.getOutputType().getFullName());
                            Method parseMethod = clazz.getDeclaredMethod("parseFrom", byte[].class);
                            Message reply = (Message) parseMethod.invoke(null, (byte[]) ack[0]);
                            done.run(reply);
                        } catch (Exception e) { // Handles various Reflection and ProtoBuf exceptions
                            logger.log(Level.WARNING, "Failed to parse", e);
                        }
                    });
        };
    }

    // Wraps a Jetty server + Socket.io servlet
    public static class RpcServer {
        private Server server;

        public RpcServer(int port, Class<? extends MrpcServlet> clazz) {
            server = new Server(port);
            ServletHandler handler = new ServletHandler();
            server.setHandler(handler);
            handler.addServletWithMapping(clazz, "/socket.io/*");
        }

        public void start() {
            try {
                server.start();
            } catch (Exception e) {
                logger.log(Level.WARNING, "Error starting server: ", e);
            }
        }

        public void join() {
            try {
                server.join();
            } catch (Exception e) {
                logger.log(Level.WARNING, "Error joining server: ", e);
            }
        }

        public void stop() {
            try {
                server.stop();
            } catch (Exception e) {
                logger.log(Level.WARNING, "Error joining server: ", e);
            }
        }
    }

    public abstract static class MrpcServlet extends HttpServlet {
        private EngineIoServer mEngineIoServer;
        private SocketIoServer mSocketIoServer;
        private SocketIoNamespace namespace;
        private boolean initCalledSuper = false;

        @Override
        public void init() {
            EngineIoServerOptions options = EngineIoServerOptions.newFromDefault();
            options.setAllowedCorsOrigins(new String[]{""});
            mEngineIoServer = new EngineIoServer(options);
            mSocketIoServer = new SocketIoServer(mEngineIoServer);
            String namespaceStr = getNamespace();
            if (namespaceStr.equals("")) {
                namespaceStr = "/";
            }
            namespace = mSocketIoServer.namespace(namespaceStr);
            namespace.on("connection", args -> {
                SocketIoSocket socket = (SocketIoSocket) args[0];
                RpcUtils.wrapSocket(socket, getServiceImpl());
                onConnect(socket);
            });
            initCalledSuper = true;
        }

        @Override
        protected void service(HttpServletRequest request, HttpServletResponse response) throws IOException {
            if (!initCalledSuper) {
                throw new RuntimeException("init() override didn't call super.init()!");
            }
            mEngineIoServer.handleRequest(request, response);
        }

        protected abstract Service getServiceImpl();
        protected abstract String getNamespace();
        protected abstract void onConnect(SocketIoSocket socket);
    }
}

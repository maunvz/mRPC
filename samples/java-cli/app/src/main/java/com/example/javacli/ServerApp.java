package com.example.javacli;

import com.example.proto.ClientGreeter;
import com.example.proto.Greeter;
import com.example.proto.HelloReply;
import com.example.proto.HelloRequest;
import com.google.protobuf.RpcCallback;
import com.google.protobuf.RpcChannel;
import com.google.protobuf.RpcController;
import com.google.protobuf.Service;
import com.nvz.mrpc.RpcUtils;

import java.util.logging.Level;
import java.util.logging.Logger;

import io.socket.socketio.server.SocketIoSocket;

public class ServerApp {
    private static final Logger logger = Logger.getLogger("Server");

    public static void main(String[] args) {
        RpcUtils.RpcServer server = new RpcUtils.RpcServer(8080, GreeterServlet.class);
        server.start();
        logger.log(Level.INFO, "Listening on port 8080");
        server.join();
    }

    public static class GreeterServlet extends RpcUtils.MrpcServlet {
        @Override
        protected Service getServiceImpl() {
            return new Greeter() {
                @Override
                public void sayHello(RpcController controller, HelloRequest request, RpcCallback<HelloReply> done) {
                    done.run(HelloReply.newBuilder()
                            .setMessage("Hello " + request.getName() + " from Java-CLI Server!")
                            .build());
                }
            };
        }

        @Override
        protected String getNamespace() {
            return "/";
        }

        @Override
        protected void onConnect(SocketIoSocket socket) {
            logger.log(Level.INFO, "Got connection from " + socket.getId());
            try {
                RpcChannel channel = RpcUtils.makeChannel(socket);
                ClientGreeter clientGreeter = (ClientGreeter) ClientGreeter.newReflectiveService(ClientGreeter.newStub(channel));
                clientGreeter.sayHello(
                        RpcUtils.getDefaultController(),
                        HelloRequest.newBuilder().setName("Java-CLI Server").build(),
                        (reply) -> {
                            logger.log(Level.INFO, "Got reply: " + reply.getMessage());
                        }
                );
            } catch (Exception e) {
                logger.log(Level.INFO, "Something bad happened", e);
            }
        }
    }
}

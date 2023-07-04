package com.nvz.mrpc;

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

public class RpcUtils {
    private static final String TAG = "RpcUtils";
    private static final Logger logger = Logger.getLogger(TAG);

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
                    impl.callMethod(method, controller, request, (response) -> {
                        ((Ack) args[1]).call(response.toByteArray());
                    });
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
}

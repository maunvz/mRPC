# mrpc-java

This is a basic Java implementation of mRPC, and just wraps the existing Socket.io and Protobuf Java libraries. To build the JAR file, simply run:
```
./gradlew jar
```
And grab the jar from ./lib/build/libs/lib.jar (rename it to mrpc-java.jar for clarify)
This JAR can be used from Java and Android applications to interact with mRPC servers

# Java-CLI

This sample uses the Gradle protobuf plugin to generate Java bindings, which requires
the helloworld.proto file to be copied into the source. It must match the sample used
by the server. I also had to compile mrpc-java and import that jar into this project,
since the library isn't hosted on any repositories

See the README.md in mrpc-java for how to publish
To run this sample, first start the node-cli sample server, then:
```
./gradlew run
```

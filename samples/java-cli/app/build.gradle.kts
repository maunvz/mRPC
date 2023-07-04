/*
 * This file was generated by the Gradle 'init' task.
 *
 * This generated file contains a sample Java application project to get you started.
 * For more details on building Java & JVM projects, please refer to https://docs.gradle.org/8.2/userguide/building_java_projects.html in the Gradle documentation.
 */

plugins {
    // Apply the application plugin to add support for building a CLI application in Java.
    application
    id("com.google.protobuf") version "0.9.3"
}

repositories {
    // Use Maven Central for resolving dependencies.
    mavenCentral()
}

dependencies {
    implementation("com.google.protobuf:protobuf-java:3.0.0")
    implementation("io.socket:socket.io-client:2.1.0")

    // This dependency is used by the application.
    implementation("com.google.guava:guava:31.1-jre")
    implementation(files("libs/mrpc-java.jar"))
}

// Apply a specific Java toolchain to ease working on different environments.
java {
    toolchain {
        languageVersion.set(JavaLanguageVersion.of(11))
    }
}

application {
    // Define the main class for the application.
    mainClass.set("com.example.javacli.Client")
}

protobuf {
    protoc {
        artifact = "com.google.protobuf:protoc:3.0.0"
    }
    generateProtoTasks {
        ofSourceSet("main").forEach {
            it.builtins {
                java {}
            }
        }
    }
}
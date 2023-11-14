# Ensure tools are set
if [ -z ${JAVA_HOME+x} ]; then echo "JAVA_HOME is unset"; exit 1; fi

OLD_PATH="$(pwd)"
ENGINEIO_PATH="$HOME/git/engine.io-server-java/"
MRPC_JAVA_PATH="$HOME/git/mRPC/mrpc-java/"
JAVA_CLI_PATH="$HOME/git/mRPC/samples/java-cli/"

# First build engine.io
cd $ENGINEIO_PATH
mvn package -DskipTests

# Copy into mrpc and sample
mkdir -p $MRPC_JAVA_PATH/lib/libs/
mkdir -p $JAVA_CLI_PATH/app/libs/
cp engine.io-server/target/engine.io-server-6.3.2.jar $MRPC_JAVA_PATH/lib/libs/engine.io-server-6.3.2.jar
cp engine.io-server/target/engine.io-server-6.3.2.jar $JAVA_CLI_PATH/app/libs/engine.io-server-6.3.2.jar

# Now build me and update sample
cd $MRPC_JAVA_PATH
./gradlew jar
cp lib/build/libs/lib.jar $JAVA_CLI_PATH/app/libs/mrpc-java.jar

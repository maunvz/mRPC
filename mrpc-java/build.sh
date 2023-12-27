# Ensure tools are set
if [ -z ${JAVA_HOME+x} ]; then echo "JAVA_HOME is unset"; exit 1; fi

# Ensure all dependencies are ready
git submodule update --init --recursive

OWN_PATH="$( cd -- "$(dirname "$0")" >/dev/null 2>&1 ; pwd -P )"
ENGINEIO_PATH="$OWN_PATH/../modules/engine.io-server-java/"

# Ensure build tool exists
if ! command -v mvn &> /dev/null
then
    echo "mvn could not be found"
    exit 1
fi

JAVA_CLI_PATH="$OWN_PATH/../samples/java-cli/"

# First build engine.io
cd $ENGINEIO_PATH
mvn package -DskipTests

# Copy into mrpc and sample
mkdir -p $OWN_PATH/lib/libs/
mkdir -p $JAVA_CLI_PATH/app/libs/
cp engine.io-server/target/engine.io-server-6.3.2.jar $OWN_PATH/lib/libs/engine.io-server-6.3.2.jar
cp engine.io-server/target/engine.io-server-6.3.2.jar $JAVA_CLI_PATH/app/libs/engine.io-server-6.3.2.jar

# Now build me and update sample
cd $OWN_PATH
./gradlew jar
cp lib/build/libs/lib.jar $JAVA_CLI_PATH/app/libs/mrpc-java.jar

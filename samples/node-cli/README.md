# Instructions:

## Library Setup
**NOTE**: This isn't published to npmjs.com yet, so these samples depend on the checked-in versions of these modules.

You'll need to compile those first. From repo root:
```
cd mrpc-node
yarn
yarn tsc
cd ../mrpc-web
yarn
yarn tsc
```
Once these are published these steps won't be necessary.

## Sample Setup
Install dependencies and generate typescript from proto by running these commands from this directory:
```
yarn
./gen.sh
```
Now run the server in one terminal:
```
yarn start_server
```
...and the client in another terminal
```
yarn start_client
```

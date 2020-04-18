# auto_farm_relay

Relays local tcp socket information from auto_farm_source to off site queue.

### Why?

Well, Rust gets messy while dealing with threads. So, instead, to provide a non-blocking solution
to provide a live feed to the user, I just made a small node app! This app will also read the SQLite
container and transmit long term data to another queue. This way, the auto_farm_source can
focus soley on being really efficent in it's loop cycles.

### How To Test?

1. ```nvm use```
2. ```npm i```
3. ```npm start```
4. open another shell
5. ```./test.sh```
6. watch data stream in!

### How To Build and Run?

1. ```docker build -t auto_farm_relay .```
2. ```docker run -d -p 5656:5656 auto_farm_relay```
3. ```docker ps``` to confirm it's running

#!/bin/bash

package="This is a sample package that is supposed to be kind of lengthy. It's just for testing purposes."

for i in {1..10000}
do
	echo $package | netcat 0.0.0.0 5656
done

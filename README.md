# Music organisation and streaming system

Tchaik is an open source music organisation and streaming system.  The backend is written in [Go](http://golang.org), the frontend is built using [React](https://facebook.github.io/react/) and [Flux](https://facebook.github.io/flux/).

![Tchaik UI](https://s3-ap-southeast-2.amazonaws.com/dhowden-pictures/screenshot.jpg "Tchaik UI")

# Features

* Automatic prefix grouping and enumeration detection (ideal for classical music: properly groups big works together).
* Multiplatform web-based UI and REST-like API for building remote controls.
* Multiple storage options: Amazon S3, local and remote file stores.
* Imports iTunes Music Library files.

# Getting up and running

### Requirements

* Go 1.4 (recent changes have only been tested on 1.4.2).
* NodeJS, NPM and Gulp installed globally (for building the UI).
* Recent version of Chrome/Firefox/Safari.

### Building

    $ go get github.com/dhowden/tchaik/...

Which will fetch the code and build the command line tools, putting the executables into `$GOPATH/bin` (which is assumed to be in your `PATH` already).

Building the UI:

    $ cd $GOPATH/src/github.com/dhowden/tchaik/cmd/tchaik/ui
    $ npm install
    $ NODE_ENV=development gulp

Alternative, if you want the JS and CSS to be recompiled, and have the browser refreshed as you change the source files:

    $ WS_URL="ws://localhost:8080/socket" NODE_ENV=development gulp serve

Now you can start Tchaik.  For the moment this means first moving to the cmd/tchaik directory:

    $ cd $GOPATH/src/github.com/dhowden/tchaik/cmd/tchaik
    $ tchaik -itlXML ~/path/to/iTunesLibrary.xml
    Parsing ~/path/to/iTunesLibrary.xml...done.
    Building Tchaik Library...done.
    Building root collection...done.
    Building search index...done.
    Web server is running on http://localhost:8080
    Quit the server with CTRL-C.

# Running tchaik

## Building your library

Tchaik can import your itunes collection. You just need to specify an XML file to process.

    $ tchimport -itlXML ~/path/to/iTunesLibrary.xml -out library.tch

Or, if you would rather Tchaik build your collection from metadata tags from files on your file system,

    $ tchimport -path ~/Music -out library.tch

## Starting tchaik

To start with a prebuilt library file, run

    $ tchaik -lib libraray.tch

Or if you would like to import the iTunes library on startup, run

    $ tchaik -itlXML ~/path/to/iTunesLibrary.xml

There are many other ways you can run tchaik.

    $ tchaik -help
    Usage of tchaik:
      -add-path-prefix="": add prefix to every path
      -artwork-cache="": path to local artwork cache (content addressable)
      -auth=false: use basic HTTP authentication
      -debug=false: print debugging information
      -itlXML="": path to iTunes Library XML file
      -lib="": path to Tchaik library file
      -listen="localhost:8080": bind address to http listen
      -local-store="/": local media store, full local path /path/to/root
      -media-cache="": path to local media cache
      -remote-store="": remote media store, tchstore server address <hostname>:<port>, or s3://<bucket>/path/to/root for S3
      -tls-cert="": path to a certificate file, must also specify -tls-key
      -tls-key="": path to a certificate key file, must also specify -tls-cert
      -trim-path-prefix="": remove prefix from every path

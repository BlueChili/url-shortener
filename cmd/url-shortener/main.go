package main

import (
	"fmt"
	"log"
	"net/http"
)

func main () {
    http.HandleFunc("/hi", func(w http.ResponseWriter, r *http.Request) {
        fmt.Fprintf(w, "testing server from %s", r.URL.Path)
    })

    http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
        fmt.Fprint(w, "hello world")
    })

    log.Fatal(http.ListenAndServe(":8080", nil))
}


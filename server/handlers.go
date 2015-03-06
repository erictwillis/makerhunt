package main

import (
	"fmt"
	"net/http"
)

func PageHandler(page string) func(w http.ResponseWriter, req *http.Request) {
	return func(w http.ResponseWriter, req *http.Request) {
		if err := templates.ExecuteTemplate(w, page, nil); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
	}
}

func notFoundHandler(w http.ResponseWriter, req *http.Request) {
	w.WriteHeader(http.StatusNotFound)
	if err := templates.ExecuteTemplate(w, "index.html", nil); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	return
}

func redirectHandler(h http.Handler) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		h.ServeHTTP(w, r)
	}
}

func recoverHandler(next http.Handler) http.Handler {
	fn := func(w http.ResponseWriter, r *http.Request) {
		defer func() {
			if err := recover(); err != nil {
				fmt.Printf("panic: %+v\n", err)
				http.Error(w, http.StatusText(500), 500) // What we had before
				return
			}
		}()

		next.ServeHTTP(w, r)
	}

	return http.HandlerFunc(fn)
}

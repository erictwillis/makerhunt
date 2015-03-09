package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestAmasCreate(t *testing.T) {
	recorder := httptest.NewRecorder()

	req, _ := http.NewRequest("POST", "/api/v1/amas", nil)

	apiAmasNew(recorder, req)

	if p, err := ioutil.ReadAll(recorder.Body); err != nil {

		t.Fail()
	} else {
		_ = p
	}
}

func TestAmasGetAll(t *testing.T) {
	recorder := httptest.NewRecorder()

	req, _ := http.NewRequest("GET", "/api/v1/amas", nil)

	apiAmasAll(recorder, req)

	amas := []AMA{}
	if err := json.NewDecoder(recorder.Body).Decode(&amas); err != nil {
		t.Fail()
	}

	fmt.Printf("%#v\n", amas)
}

func TestAmasGet(t *testing.T) {
	recorder := httptest.NewRecorder()

	req, _ := http.NewRequest("GET", "/api/v1/amas/54f9c4c2bb5f46619b000001", nil)

	apiAmaGet(recorder, req)

	ama := AMA{}
	if err := json.NewDecoder(recorder.Body).Decode(&ama); err != nil {
		t.Fail()
	}

	fmt.Printf("%#v\n", ama)
}

func TestAmasUpdate(t *testing.T) {
	recorder := httptest.NewRecorder()

	req, _ := http.NewRequest("PUT", "/api/v1/amas/54f9bc4dbb5f465d1d000001", nil)

	apiAmaUpdate(recorder, req)

	if p, err := ioutil.ReadAll(recorder.Body); err != nil {
		t.Fail()
	} else {
		_ = p
	}
}

func TestAmasDelete(t *testing.T) {
	recorder := httptest.NewRecorder()

	req, _ := http.NewRequest("DELETE", "/api/v1/amas/54f9bc4dbb5f465d1d000001", nil)

	apiAmaDelete(recorder, req)

	if p, err := ioutil.ReadAll(recorder.Body); err != nil {
		t.Fail()
	} else {
		_ = p
	}
}

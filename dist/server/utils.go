package main

import (
	"encoding/json"
	"math/rand"
	"net/http"
	"reflect"
)

func Merge(dest interface{}, src interface{}) error {
	vSrc := reflect.ValueOf(src)

	vDst := reflect.ValueOf(dest)
	if vDst.Kind() == reflect.Ptr {
		vDst = vDst.Elem()
	}
	return merge(vDst, vSrc)
}

func merge(dest reflect.Value, src reflect.Value) error {
	switch src.Kind() {
	case reflect.Struct:
		// try to set the struct
		if src.Type() == dest.Type() {
			if !dest.CanSet() {
				return nil
			}

			dest.Set(src)
			return nil
		}

		for i := 0; i < src.NumField(); i++ {
			tField := src.Type().Field(i)

			df := dest.FieldByName(tField.Name)
			if df.Kind() == 0 {
				continue
			}

			if err := merge(df, src.Field(i)); err != nil {
				return err
			}
		}

	case reflect.Map:
		x := reflect.MakeMap(dest.Type())
		for _, k := range src.MapKeys() {
			x.SetMapIndex(k, src.MapIndex(k))
		}
		dest.Set(x)
	case reflect.Slice:
		x := reflect.MakeSlice(dest.Type(), src.Len(), src.Len())
		for j := 0; j < src.Len(); j++ {
			merge(x.Index(j), src.Index(j))
		}
		dest.Set(x)
	case reflect.Chan:
	case reflect.Ptr:
		if !src.IsNil() && dest.CanSet() {
			x := reflect.New(dest.Type().Elem())
			merge(x.Elem(), src.Elem())
			dest.Set(x)
		}
	default:
		if !dest.CanSet() {
			return nil
		}
		dest.Set(src)
	}

	return nil
}

func WriteJSON(w http.ResponseWriter, o interface{}) {
	w.Header().Set("Content-Type", "application/json")

	if err := json.NewEncoder(w).Encode(o); err != nil {
		http.Error(w, err.Error(), 500)
	}
}

var letters = []rune("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ")

func randSeq(n int) string {
	b := make([]rune, n)
	for i := range b {
		b[i] = letters[rand.Intn(len(letters))]
	}
	return string(b)
}

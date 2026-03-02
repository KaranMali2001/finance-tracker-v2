package utils

import "strings"

func TokenJaccard(a, b string) float64 {
	setA := tokenSet(a)
	setB := tokenSet(b)
	if len(setA) == 0 && len(setB) == 0 {
		return 0
	}
	intersection := 0
	for t := range setA {
		if setB[t] {
			intersection++
		}
	}
	union := len(setA) + len(setB) - intersection
	if union == 0 {
		return 0
	}
	return float64(intersection) / float64(union)
}

func tokenSet(s string) map[string]bool {
	set := make(map[string]bool)
	for _, t := range strings.Fields(strings.ToLower(s)) {
		set[t] = true
	}
	return set
}

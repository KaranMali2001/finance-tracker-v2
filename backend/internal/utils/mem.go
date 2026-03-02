package utils

import (
	"fmt"
	"runtime"

	"github.com/rs/zerolog"
)

func LogMem(phase string, log *zerolog.Logger) {
	var m runtime.MemStats
	runtime.ReadMemStats(&m)
	log.Info().
		Str("phase", phase).
		Str("alloc_mb", fmt.Sprintf("%.2f", float64(m.Alloc)/1024/1024)).
		Str("total_alloc_mb", fmt.Sprintf("%.2f", float64(m.TotalAlloc)/1024/1024)).
		Str("sys_mb", fmt.Sprintf("%.2f", float64(m.Sys)/1024/1024)).
		Uint32("gc_cycles", m.NumGC).
		Msg("[MEM]")
}

package static

type Bank struct {
	Id   string `json:"id,omitempty"`
	Name string `json:"name,omitempty"`
	Code string `json:"code,omitempty"`
}
type Categories struct {
	Id   string `json:"id,omitempty"`
	Name string `json:"name,omitempty"`
	Type string `json:"type,omitempty"`
}
type Merchants struct {
	Id   string `json:"id,omitempty"`
	Name string `json:"name,omitempty"`
}
type EmptyStruct struct{}

func (u *EmptyStruct) Validate() error {
	return nil
}

package dispatcher

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/aws/aws-sdk-go-v2/aws"
	awsconfig "github.com/aws/aws-sdk-go-v2/config"
	lambdasdk "github.com/aws/aws-sdk-go-v2/service/lambda"
	"github.com/aws/aws-sdk-go-v2/service/lambda/types"
)

type LambdaDispatcher struct {
	client             *lambdasdk.Client
	workerFunctionName string
}

func NewLambdaDispatcher(functionName, endpointURL string) (*LambdaDispatcher, error) {
	awsCfg, err := awsconfig.LoadDefaultConfig(context.Background())
	if err != nil {
		return nil, fmt.Errorf("failed to load AWS config: %w", err)
	}

	clientOpts := []func(*lambdasdk.Options){}
	if endpointURL != "" {
		clientOpts = append(clientOpts, func(o *lambdasdk.Options) {
			o.BaseEndpoint = aws.String(endpointURL)
		})
	}

	return &LambdaDispatcher{
		client:             lambdasdk.NewFromConfig(awsCfg, clientOpts...),
		workerFunctionName: functionName,
	}, nil
}

func (d *LambdaDispatcher) Dispatch(ctx context.Context, job JobPayload) error {
	body, err := json.Marshal(job)
	if err != nil {
		return fmt.Errorf("failed to marshal job payload: %w", err)
	}
	_, err = d.client.Invoke(ctx, &lambdasdk.InvokeInput{
		FunctionName:   aws.String(d.workerFunctionName),
		InvocationType: types.InvocationTypeEvent,
		Payload:        body,
	})
	return err
}

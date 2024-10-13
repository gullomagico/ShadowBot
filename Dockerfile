FROM golang:1.23.2-alpine3.20 AS builder
WORKDIR /app
COPY . .
RUN go mod tidy && go build -o shadowbot

FROM alpine:3.20
WORKDIR /app
COPY --from=builder /app/shadowbot .
CMD ["./shadowbot"]
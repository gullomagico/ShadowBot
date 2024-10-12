BIN_NAME=shadowbot
ENV_FILE=.env

run-local:
	-@go run . -env $(ENV_FILE) -log debug

run:
	@echo "Running $(BIN_NAME)..."
	./$(BIN_NAME)

build:
	@echo "Building $(BIN_NAME)..."
	go build -o $(BIN_NAME)

clean:
	@echo "Cleaning up..."
	rm -f $(BIN_NAME)


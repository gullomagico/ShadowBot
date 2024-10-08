BIN_NAME=shadowbot
ENV_FILE=.env

run-local:
	-@echo "Loading environment from $(ENV_FILE)..."; \
	env $$(cat $(ENV_FILE) | grep -v '^#' | xargs) go run .; \

run:
	@echo "Running $(BIN_NAME)..."
	./$(BIN_NAME)

build:
	@echo "Building $(BIN_NAME)..."
	go build -o $(BIN_NAME)

clean:
	@echo "Cleaning up..."
	rm -f $(BIN_NAME)


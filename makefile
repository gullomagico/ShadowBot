BIN_NAME=shadowbot
ENV_FILE=.env

run:
	@if [ -f $(ENV_FILE) ]; then \
		echo "Loading environment from $(ENV_FILE)..."; \
		env $$(cat $(ENV_FILE) | grep -v '^#' | xargs) go run . ; \
	else \
		echo "$(ENV_FILE) not found, running with system environment variables..."; \
		- go run . ; \
	fi

build:
	@echo "Building $(BIN_NAME)..."
	go build -o $(BIN_NAME)

clean:
	@echo "Cleaning up..."
	rm -f $(BIN_NAME)


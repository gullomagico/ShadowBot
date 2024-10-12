APP_NAME=shadowbot
DOCKER_IMAGE = gullomagico/$(APP_NAME)
VERSION = 0.1.0

build:
	@echo "Building $(BIN_NAME)..."
	go build -o $(BIN_NAME)

run:
	@echo "Running $(BIN_NAME)..."
	./$(BIN_NAME)

docker-build:
	@echo "Building docker image..."
	docker build -t $(DOCKER_IMAGE):$(VERSION) .

docker-run:
	@echo "Lauching docker container..."
	docker run --rm $(DOCKER_IMAGE):$(VERSION)

docker-run-local:
	@echo "Lauching docker container..."
	docker run --rm -v $(shell pwd)/.env:/run/secrets/shadowbot $(DOCKER_IMAGE):$(VERSION)

docker-push:
	@echo "Pushing image to Docker Hub..."
	docker push $(DOCKER_IMAGE):$(VERSION)

run-local:
	-@go run . -env $(ENV_FILE) -log debug

clean:
	@echo "Cleaning up..."
	rm -f $(BIN_NAME)


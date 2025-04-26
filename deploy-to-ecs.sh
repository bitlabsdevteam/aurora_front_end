#!/bin/bash
set -e

# Configuration
# Replace these with your actual values
AWS_REGION=${AWS_REGION:-"us-east-1"}
AWS_ACCOUNT_ID=${AWS_ACCOUNT_ID:-"123456789012"}
ECR_REPOSITORY_NAME=${ECR_REPOSITORY_NAME:-"aurora-frontend"}
ECS_CLUSTER=${ECS_CLUSTER:-"aurora-cluster"}
ECS_SERVICE=${ECS_SERVICE:-"frontend-service"}
IMAGE_TAG=${IMAGE_TAG:-$(git rev-parse --short HEAD)}

# Derived values
ECR_REPOSITORY_URI="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPOSITORY_NAME}"
ECS_EXECUTION_ROLE_ARN="arn:aws:iam::${AWS_ACCOUNT_ID}:role/ecsTaskExecutionRole"
ECS_TASK_ROLE_ARN="arn:aws:iam::${AWS_ACCOUNT_ID}:role/ecsTaskRole"

echo "Deploying to AWS ECS..."
echo "Using image tag: ${IMAGE_TAG}"

# Log in to ECR
echo "Logging in to Amazon ECR..."
aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com

# Create the ECR repository if it doesn't exist
echo "Creating ECR repository if it doesn't exist..."
aws ecr describe-repositories --repository-names ${ECR_REPOSITORY_NAME} --region ${AWS_REGION} || \
  aws ecr create-repository --repository-name ${ECR_REPOSITORY_NAME} --region ${AWS_REGION}

# Build and tag the Docker image
echo "Building and tagging Docker image..."
export ECR_REPOSITORY_URI=${ECR_REPOSITORY_URI}
export IMAGE_TAG=${IMAGE_TAG}
docker-compose build

# Push the Docker image to ECR
echo "Pushing Docker image to ECR..."
docker push ${ECR_REPOSITORY_URI}:${IMAGE_TAG}

# Generate the ECS task definition file with the correct values
echo "Generating ECS task definition..."
cat ecs-task-definition.json | \
  sed "s|\${ECS_EXECUTION_ROLE_ARN}|${ECS_EXECUTION_ROLE_ARN}|g" | \
  sed "s|\${ECS_TASK_ROLE_ARN}|${ECS_TASK_ROLE_ARN}|g" | \
  sed "s|\${ECR_REPOSITORY_URI}|${ECR_REPOSITORY_URI}|g" | \
  sed "s|\${IMAGE_TAG}|${IMAGE_TAG}|g" | \
  sed "s|\${AWS_REGION}|${AWS_REGION}|g" > ecs-task-definition-resolved.json

# Register the ECS task definition
echo "Registering ECS task definition..."
TASK_DEFINITION_ARN=$(aws ecs register-task-definition --cli-input-json file://ecs-task-definition-resolved.json --region ${AWS_REGION} --query 'taskDefinition.taskDefinitionArn' --output text)
echo "Task definition registered: ${TASK_DEFINITION_ARN}"

# Update the ECS service with the new task definition
echo "Updating ECS service..."
aws ecs update-service --cluster ${ECS_CLUSTER} --service ${ECS_SERVICE} --task-definition ${TASK_DEFINITION_ARN} --region ${AWS_REGION}

echo "Deployment initiated successfully!"
echo "Check the status with: aws ecs describe-services --cluster ${ECS_CLUSTER} --services ${ECS_SERVICE} --region ${AWS_REGION}" 
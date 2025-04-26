# Aurora Front End Application

This is the front end application for the Aurora project. This README provides instructions for setting up the application both locally and deploying it to AWS ECS.

## Table of Contents

- [Local Development](#local-development)
- [Dockerized Development](#dockerized-development)
- [AWS ECS Deployment](#aws-ecs-deployment)
  - [Prerequisites](#prerequisites)
  - [Setup AWS Environment](#setup-aws-environment)
  - [Deploy to ECS](#deploy-to-ecs)
  - [Monitoring and Troubleshooting](#monitoring-and-troubleshooting)
- [CI/CD Pipeline](#cicd-pipeline)

## Local Development

To run the application locally:

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

The application will be available at http://localhost:3000.

## Dockerized Development

You can also run the application using Docker:

```bash
# Build and run the Docker container
./docker-build.sh

# Or with Docker Compose
docker-compose up -d
```

## AWS ECS Deployment

### Prerequisites

Before deploying to AWS ECS, ensure you have:

1. AWS CLI installed and configured
2. Docker installed
3. AWS IAM permissions for ECR, ECS, CloudWatch, and IAM roles
4. An ECS cluster set up (Fargate recommended)

### Setup AWS Environment

#### 1. Install and Configure AWS CLI

```bash
# Install AWS CLI (macOS)
brew install awscli

# Or for Linux
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Configure AWS CLI
aws configure
# Enter your AWS Access Key ID, Secret Key, region (e.g., us-east-1), and output format (json)
```

#### 2. Create Required IAM Roles

AWS ECS requires two IAM roles:
- `ecsTaskExecutionRole`: Allows ECS to pull images from ECR and push logs to CloudWatch
- `ecsTaskRole`: Provides permissions for your application running inside the container

You can create these using the AWS Console or CLI:

```bash
# Create ECS Task Execution Role
aws iam create-role --role-name ecsTaskExecutionRole --assume-role-policy-document file://ecs-task-execution-role-trust-policy.json
aws iam attach-role-policy --role-name ecsTaskExecutionRole --policy-arn arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy

# Create ECS Task Role
aws iam create-role --role-name ecsTaskRole --assume-role-policy-document file://ecs-task-role-trust-policy.json
aws iam attach-role-policy --role-name ecsTaskRole --policy-arn arn:aws:iam::aws:policy/AmazonS3ReadOnlyAccess
# Add other policies your application needs
```

Create `ecs-task-execution-role-trust-policy.json`:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "ecs-tasks.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
```

#### 3. Create an ECS Cluster (if you don't already have one)

```bash
aws ecs create-cluster --cluster-name aurora-cluster --capacity-providers FARGATE
```

#### 4. Create a CloudWatch Log Group

```bash
aws logs create-log-group --log-group-name /ecs/aurora-frontend --region us-east-1
```

#### 5. Create an ECS Service (optional - can be done through the deployment script)

```bash
aws ecs create-service --cluster aurora-cluster \
  --service-name frontend-service \
  --task-definition aurora-frontend:1 \
  --desired-count 1 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-12345678,subnet-87654321],securityGroups=[sg-12345678],assignPublicIp=ENABLED}"
```

### Deploy to ECS

#### 1. Set Environment Variables

```bash
export AWS_REGION=us-east-1  # Replace with your region
export AWS_ACCOUNT_ID=123456789012  # Replace with your AWS account ID
export ECR_REPOSITORY_NAME=aurora-frontend
export ECS_CLUSTER=aurora-cluster
export ECS_SERVICE=frontend-service
export IMAGE_TAG=v1.0.0  # Or any tag you want to use
```

#### 2. Run the Deployment Script

```bash
./deploy-to-ecs.sh
```

This script will:
1. Log in to Amazon ECR
2. Create the ECR repository if it doesn't exist
3. Build and tag the Docker image
4. Push the image to ECR
5. Create/update the ECS task definition
6. Deploy the new version to your ECS service

#### 3. Verify Deployment

```bash
# Check service status
aws ecs describe-services --cluster aurora-cluster --services frontend-service

# View running tasks
aws ecs list-tasks --cluster aurora-cluster --service-name frontend-service

# Check logs
aws logs get-log-events --log-group-name /ecs/aurora-frontend --log-stream-name web/TASK_ID
```

### Monitoring and Troubleshooting

#### CloudWatch Logs

All container logs are sent to CloudWatch Logs. You can view them in the AWS Console under CloudWatch > Log Groups > /ecs/aurora-frontend.

#### Container Insights

Enable Container Insights for detailed metrics:

```bash
aws ecs update-cluster-settings --cluster aurora-cluster --settings name=containerInsights,value=enabled
```

#### Common Issues and Solutions

1. **Task fails to start**:
   - Check CloudWatch logs for application errors
   - Verify IAM permissions are correct
   - Ensure subnets and security groups allow necessary traffic

2. **Container health check fails**:
   - Verify the application is running on port 3000
   - Check that the health check endpoint is accessible

3. **Cannot pull image from ECR**:
   - Ensure ecsTaskExecutionRole has permission to pull from ECR
   - Verify the image URI is correct

## CI/CD Pipeline

For automated deployments, you can integrate the deployment script with CI/CD tools like GitHub Actions or AWS CodePipeline.

### Example GitHub Actions Workflow

Create a file at `.github/workflows/deploy-to-ecs.yml`:

```yaml
name: Deploy to Amazon ECS

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    name: Deploy
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout
      uses: actions/checkout@v3
      
    - name: Configure AWS credentials
      uses: aws-actions/configure-aws-credentials@v1
      with:
        aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
        aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        aws-region: us-east-1
        
    - name: Login to Amazon ECR
      id: login-ecr
      uses: aws-actions/amazon-ecr-login@v1
      
    - name: Build, tag, and push image to Amazon ECR
      env:
        ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
        ECR_REPOSITORY: aurora-frontend
        IMAGE_TAG: ${{ github.sha }}
      run: |
        docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG .
        docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG
        
    - name: Deploy to Amazon ECS
      env:
        AWS_REGION: us-east-1
        ECR_REPOSITORY: aurora-frontend
        ECS_CLUSTER: aurora-cluster
        ECS_SERVICE: frontend-service
        IMAGE_TAG: ${{ github.sha }}
      run: |
        aws ecs update-service --cluster $ECS_CLUSTER --service $ECS_SERVICE --force-new-deployment
```

---

For more information on AWS ECS, refer to the [AWS ECS documentation](https://docs.aws.amazon.com/ecs/index.html).

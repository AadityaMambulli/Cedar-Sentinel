"""Model configuration for the Strands agent supporting Amazon Bedrock & Ollama fallback."""

import os
import logging
from typing import Optional
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

# Default model identifiers and endpoints
DEFAULT_BEDROCK_MODEL_ID = os.getenv("BEDROCK_MODEL_ID", "amazon.nova-micro-v1:0")
DEFAULT_BEDROCK_REGION = os.getenv("BEDROCK_AWS_REGION", "us-east-1")
DEFAULT_OLLAMA_HOST = os.getenv("OLLAMA_HOST", "http://localhost:11434")
DEFAULT_OLLAMA_MODEL_ID = os.getenv("OLLAMA_MODEL_ID", "hf.co/Qwen/Qwen2.5-Coder-1.5B-Instruct-GGUF:Q8_0")


def get_bedrock_model(
    model_id: str = DEFAULT_BEDROCK_MODEL_ID,
    region_name: str = DEFAULT_BEDROCK_REGION,
    access_key_id: Optional[str] = None,
    secret_access_key: Optional[str] = None,
    session_token: Optional[str] = None,
    profile_name: Optional[str] = None,
):
    """Instantiate a Strands BedrockModel using isolated AWS credentials or profile.

    This prevents collision with default AWS credentials used for OpenSearch/DynamoDB.
    """
    import boto3
    from strands.models.bedrock import BedrockModel

    access_key_id = access_key_id or os.getenv("BEDROCK_AWS_ACCESS_KEY_ID")
    secret_access_key = secret_access_key or os.getenv("BEDROCK_AWS_SECRET_ACCESS_KEY")
    session_token = session_token or os.getenv("BEDROCK_AWS_SESSION_TOKEN")
    profile_name = profile_name or os.getenv("BEDROCK_PROFILE_NAME")
    region_name = region_name or os.getenv("BEDROCK_AWS_REGION", "us-east-1")

    session_kwargs = {"region_name": region_name}
    if profile_name:
        session_kwargs["profile_name"] = profile_name
    elif access_key_id and secret_access_key:
        session_kwargs["aws_access_key_id"] = access_key_id
        session_kwargs["aws_secret_access_key"] = secret_access_key
        if session_token:
            session_kwargs["aws_session_token"] = session_token

    boto_session = boto3.Session(**session_kwargs)
    return BedrockModel(
        boto_session=boto_session,
        model_id=model_id,
    )


def get_ollama_model(
    model_id: str = DEFAULT_OLLAMA_MODEL_ID,
    host: str = DEFAULT_OLLAMA_HOST,
):
    """Instantiate a Strands OllamaModel pointing to local Ollama server."""
    from strands.models.ollama import OllamaModel

    return OllamaModel(
        host=host,
        model_id=model_id,
    )

def get_omniroute_model(
    api_key: Optional[str] = None,
    base_url: Optional[str] = None,
    model_id: Optional[str] = None,
):
    """Instantiate a Strands OpenAIModel pointing at the Omniroute proxy
    (OpenAI-compatible API), used as a more capable tool-calling provider
    than the small local Ollama model.
    """
    from strands.models.openai import OpenAIModel

    api_key = api_key or os.getenv("OMNIROUTE_API_KEY")
    base_url = base_url or os.getenv("OMNIROUTE_BASE_URL")
    model_id = model_id or os.getenv("OMNIROUTE_MODEL_ID", "gpt-4o")

    if not api_key or not base_url:
        raise ValueError("OMNIROUTE_API_KEY and OMNIROUTE_BASE_URL must be set")

    return OpenAIModel(
        client_args={
            "api_key": api_key,
            "base_url": base_url,
        },
        model_id=model_id,
        params={
            "max_tokens": 1000,
            "temperature": 0.7,
        },
    )


def get_model(force_provider: Optional[str] = None):
    """Resolve and return the appropriate Strands Model instance.

    Priority:
    1. If `force_provider == 'bedrock'` or (`force_provider is None` and Bedrock credentials/profile are configured):
       Attempt BedrockModel (Nova Micro / Lite).
    2. Fallback to OllamaModel (hf.co/Qwen/Qwen2.5-Coder-1.5B-Instruct-GGUF:Q8_0 on local Ollama).
    """
    provider = (force_provider or os.getenv("MODEL_PROVIDER", "")).strip().lower()

    has_bedrock_creds = bool(
        os.getenv("BEDROCK_AWS_ACCESS_KEY_ID")
        or os.getenv("BEDROCK_PROFILE_NAME")
    )
    has_omniroute_creds = bool(
        os.getenv("OMNIROUTE_API_KEY") and os.getenv("OMNIROUTE_BASE_URL")
    )

    if provider == "bedrock" or (not provider and has_bedrock_creds):
        try:
            logger.info("Initializing BedrockModel (%s in %s)...", DEFAULT_BEDROCK_MODEL_ID, DEFAULT_BEDROCK_REGION)
            return get_bedrock_model()
        except Exception as e:
            logger.warning("Failed to initialize BedrockModel (%s), trying next provider.", e)

    if provider == "omniroute" or (not provider and has_omniroute_creds):
        try:
            logger.info("Initializing OmniroteModel via OpenAI-compatible proxy...")
            return get_omniroute_model()
        except Exception as e:
            logger.warning("Failed to initialize Omniroute Model (%s), trying next provider.", e)

    logger.info("Using OllamaModel (%s at %s)", DEFAULT_OLLAMA_MODEL_ID, DEFAULT_OLLAMA_HOST)
    return get_ollama_model()

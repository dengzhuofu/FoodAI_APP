import os
from fastapi import UploadFile
import oss2
from app.core.config import settings


class OSSService:
    def __init__(self):
        raw_access_key_id = (
            os.getenv("TENCENT_COS_SECRET_ID")
            or settings.TENCENT_COS_SECRET_ID
            or os.getenv("ALIYUN_OSS_ACCESS_KEY_ID")
            or ""
        )
        raw_access_key_secret = (
            os.getenv("TENCENT_COS_SECRET_KEY")
            or settings.TENCENT_COS_SECRET_KEY
            or os.getenv("ALIYUN_OSS_ACCESS_KEY_SECRET")
            or ""
        )
        raw_endpoint = (
            os.getenv("TENCENT_COS_REGION")
            or settings.TENCENT_COS_REGION
            or os.getenv("ALIYUN_OSS_ENDPOINT")
            or ""
        )
        raw_bucket = (
            os.getenv("TENCENT_COS_BUCKET")
            or settings.TENCENT_COS_BUCKET
            or os.getenv("ALIYUN_OSS_BUCKET")
            or ""
        )

        self.access_key_id = raw_access_key_id.strip()
        self.access_key_secret = raw_access_key_secret.strip()
        self.endpoint = raw_endpoint.strip()
        self.bucket_name = raw_bucket.strip()

        self.bucket = None
        if self.access_key_id and self.access_key_secret and self.endpoint and self.bucket_name:
            endpoint_url = self.endpoint
            if not endpoint_url.startswith("http://") and not endpoint_url.startswith("https://"):
                endpoint_url = f"https://{endpoint_url}"

            auth = oss2.Auth(self.access_key_id, self.access_key_secret)
            self.bucket = oss2.Bucket(auth, endpoint_url, self.bucket_name)
            self.endpoint = endpoint_url

    def is_configured(self) -> bool:
        return self.bucket is not None

    def _public_url(self, key: str) -> str:
        safe_key = key.lstrip("/")
        endpoint_host = self.endpoint.split("://", 1)[-1].rstrip("/")
        return f"https://{self.bucket_name}.{endpoint_host}/{safe_key}"

    async def upload_file(self, file: UploadFile, key: str) -> str:
        if not self.bucket:
            raise Exception("OSS client not configured")

        try:
            content = await file.read()
            return await self.upload_bytes(content, key)
        except Exception:
            await file.seek(0)
            raise

    async def upload_bytes(self, content: bytes, key: str) -> str:
        if not self.bucket:
            raise Exception("OSS client not configured")

        self.bucket.put_object(key, content)
        return self._public_url(key)


oss_service = OSSService()

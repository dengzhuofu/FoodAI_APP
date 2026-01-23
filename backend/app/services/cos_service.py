from qcloud_cos import CosConfig
from qcloud_cos import CosS3Client
import sys
import os
import logging
from app.core.config import settings
from fastapi import UploadFile

class COSService:
    def __init__(self):
        # 强制从环境变量获取，确保不受 .env 缓存或加载顺序影响
        # 使用 strip() 去除可能存在的首尾空格（这是最常见的配置错误）
        raw_secret_id = os.getenv("TENCENT_COS_SECRET_ID") or settings.TENCENT_COS_SECRET_ID or ""
        raw_secret_key = os.getenv("TENCENT_COS_SECRET_KEY") or settings.TENCENT_COS_SECRET_KEY or ""
        raw_region = os.getenv("TENCENT_COS_REGION") or settings.TENCENT_COS_REGION or ""
        raw_bucket = os.getenv("TENCENT_COS_BUCKET") or settings.TENCENT_COS_BUCKET or ""

        self.secret_id = raw_secret_id.strip()
        self.secret_key = raw_secret_key.strip()
        self.region = raw_region.strip()
        self.bucket = raw_bucket.strip()
        
        # 打印部分 Key 用于调试 (仅打印前3后3位)
        if self.secret_key and len(self.secret_key) > 6:
            masked_key = f"{self.secret_key[:3]}...{self.secret_key[-3:]}"
        else:
            masked_key = "None"
            
        # 使用 repr() 打印 Bucket 名称，这样如果有不可见字符或空格就能看出来了
        print(f"DEBUG: COS Config - Region: '{self.region}', Bucket: '{self.bucket}', SecretId: {self.secret_id[:4] if self.secret_id else 'None'}..., SecretKey: {masked_key}")

        self.client = None
        if self.secret_id and self.secret_key and self.bucket:
            try:
                print(f"Initializing COS Service with bucket: {self.bucket}, region: {self.region}")
                config = CosConfig(Region=self.region, SecretId=self.secret_id, SecretKey=self.secret_key)
                self.client = CosS3Client(config)
                print("COS Service initialized successfully.")
            except Exception as e:
                print(f"Error initializing COS client: {e}")
        else:
            print("COS Service skipped: Missing configuration (SecretId/Key/Bucket).")

    def is_configured(self) -> bool:
        return self.client is not None

    async def upload_file(self, file: UploadFile, key: str) -> str:
        """
        Upload file to COS and return the public URL.
        """
        if not self.client:
            raise Exception("COS client not configured")
        
        try:
            # Read file content
            # Note: This reads entire file into memory. 
            # For very large files, consider using chunked upload or temporary file.
            content = await file.read()
            
            # Upload
            response = self.client.put_object(
                Bucket=self.bucket,
                Body=content,
                Key=key,
                EnableMD5=False
            )
            
            # Reset file pointer for subsequent reads if any
            await file.seek(0)
            
            # Generate URL
            # Standard COS URL format: https://<bucket>.cos.<region>.myqcloud.com/<key>
            url = f"https://{self.bucket}.cos.{self.region}.myqcloud.com/{key}"
            return url
            
        except Exception as e:
            print(f"COS Upload Error: {e}")
            # Reset file pointer in case of error too, so fallback can use it
            await file.seek(0)
            raise e

cos_service = COSService()

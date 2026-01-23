from qcloud_cos import CosConfig
from qcloud_cos import CosS3Client
import sys
import os
import logging
from app.core.config import settings
from fastapi import UploadFile

class COSService:
    def __init__(self):
        self.secret_id = settings.TENCENT_COS_SECRET_ID
        self.secret_key = settings.TENCENT_COS_SECRET_KEY
        self.region = settings.TENCENT_COS_REGION
        self.bucket = settings.TENCENT_COS_BUCKET
        
        self.client = None
        if self.secret_id and self.secret_key and self.bucket:
            try:
                config = CosConfig(Region=self.region, SecretId=self.secret_id, SecretKey=self.secret_key)
                self.client = CosS3Client(config)
            except Exception as e:
                print(f"Error initializing COS client: {e}")

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

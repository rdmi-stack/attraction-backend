interface UploadResult {
    url: string;
    publicId: string;
    width?: number;
    height?: number;
}
export declare const uploadImage: (filePath: string, folder?: string) => Promise<UploadResult>;
export declare const uploadBase64Image: (base64Data: string, folder?: string) => Promise<UploadResult>;
export declare const deleteImage: (publicId: string) => Promise<void>;
export declare const getOptimizedUrl: (publicId: string, options?: {
    width?: number;
    height?: number;
}) => string;
export {};
//# sourceMappingURL=upload.service.d.ts.map
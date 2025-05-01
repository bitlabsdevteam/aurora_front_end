'use client';

import React, { useState, useEffect } from 'react';
import TopWidgets from '../components/dashboard/TopWidgets';
import TrendPredictions from '../components/TrendPredictions';
import { Skeleton, Card, Input, Button, Upload, message } from 'antd';
import { SendHorizontal, ImagePlus } from 'lucide-react';
import type { UploadFile } from 'antd/es/upload/interface';
import MasterLayout from '../components/layout/MasterLayout';

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [userInput, setUserInput] = useState("");
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const handleSend = () => {
    if (!userInput.trim() && fileList.length === 0) {
      message.warning("Please enter a message or upload an image");
      return;
    }
    // Handle sending message and files to Eri
    console.log("Sending:", { message: userInput, files: fileList });
    setUserInput("");
    setFileList([]);
  };

  const handleFileChange = ({ fileList: newFileList }: { fileList: UploadFile[] }) => {
    setFileList(newFileList);
  };

  const content = (
    <div className="min-h-screen bg-[#F8F9FE] p-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Fashion Trend Forecasting</h1>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-500">
            Last updated: {new Date().toLocaleString()}
          </span>
        </div>
      </div>

      <div className="space-y-6">
        <TopWidgets />

        <div className="space-y-6">
          {/* Trend Predictions Section */}
          <Card className="mb-6">
            <TrendPredictions />
          </Card>

          <Card>
            <div className="flex items-center gap-6 mb-4">
              <div className="w-10 h-10 rounded-full bg-[#4745D0] flex items-center justify-center">
                <span className="text-white font-semibold">E</span>
              </div>
              <div>
                <h2 className="text-lg font-medium">Eri - Your Fashion AI Assistant</h2>
                <p className="text-sm text-gray-500">
                  Ask for trend insights or upload images for trend analysis
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <div className="flex-1">
                <Input.TextArea
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="Ask about emerging fashion trends or upload images..."
                  autoSize={{ minRows: 3, maxRows: 6 }}
                  className="resize-none"
                />
              </div>
              <Upload
                fileList={fileList}
                onChange={handleFileChange}
                maxCount={5}
                multiple
                accept="image/*"
                showUploadList={false}
              >
                <Button
                  icon={<ImagePlus className="w-4 h-4" />}
                  className="flex items-center justify-center"
                />
              </Upload>
              <Button
                type="primary"
                icon={<SendHorizontal className="w-4 h-4" />}
                onClick={handleSend}
                className="flex items-center justify-center bg-[#4745D0]"
              >
                Send
              </Button>
            </div>

            {fileList.length > 0 && (
              <div className="mt-4 flex gap-2 flex-wrap">
                {fileList.map((file) => (
                  <div key={file.uid} className="relative group">
                    <img
                      src={URL.createObjectURL(file.originFileObj as Blob)}
                      alt="Preview"
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => setFileList(fileList.filter((f) => f.uid !== file.uid))}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <MasterLayout>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-6 shadow-sm">
                <Skeleton active />
              </div>
            ))}
          </div>
        </div>
      </MasterLayout>
    );
  }

  return <MasterLayout>{content}</MasterLayout>;
};

export default Dashboard; 
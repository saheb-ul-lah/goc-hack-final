"use client";

import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Share2, QrCode } from 'lucide-react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from 'react-toastify';

const TestShareCard = ({ testLink, testCode }) => {
  const [showQR, setShowQR] = useState(false);

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard!');
    } catch (err) {
      toast.error('Failed to copy text');
    }
  };

  const shareTest = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Take my test',
          text: 'Here is your test link',
          url: testLink
        });
        toast.success('Shared successfully!');
      } catch (err) {
        if (err.name !== 'AbortError') {
          toast.error('Error sharing test');
        }
      }
    } else {
      copyToClipboard(testLink);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto mt-6 mb-6 bg-gray-800 text-white shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Share Test</CardTitle>
        <CardDescription className="text-gray-400">
          Share your test using any of these methods
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        
        {/* Test Link Section */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">Test Link</label>
          <div className="flex gap-2">
            <Input 
              value={testLink} 
              readOnly 
              className="flex-1 bg-gray-700 text-gray-100"
            />
            <Button
              onClick={() => copyToClipboard(testLink)}
              variant="outline"
              size="icon"
              className="text-gray-800 border-gray-600 hover:bg-gray-200"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Test Code Section */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">Test Code</label>
          <div className="flex gap-2">
            <Input 
              value={testCode} 
              readOnly 
              className="flex-1 bg-gray-700 text-gray-100"
            />
            <Button
              onClick={() => copyToClipboard(testCode)}
              variant="outline"
              size="icon"
              className="text-gray-800 border-gray-600 hover:bg-gray-200"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 justify-center mt-4">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex gap-2 text-gray-900 border-gray-600 hover:bg-gray-200">
                <QrCode className="h-4 w-4" />
                Show QR Code
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-gray-800 text-white">
              <DialogHeader>
                <DialogTitle>Test QR Code</DialogTitle>
              </DialogHeader>
              <div className="flex justify-center p-4">
                <QRCodeSVG
                  value={testLink}
                  size={256}
                  level="H"
                  includeMargin={true}
                  className="w-full max-w-[256px]"
                />
              </div>
            </DialogContent>
          </Dialog>

          <Button 
            onClick={shareTest} 
            variant="default"
            className="flex gap-2 bg-orange-600 hover:bg-orange-700 text-white"
          >
            <Share2 className="h-4 w-4" />
            Share Test
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TestShareCard;

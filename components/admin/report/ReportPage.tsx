"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Save,
  Send,
  FileText,
  Paperclip,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";

export function ReportPage() {
  const t = useTranslations("admin.report");
  const [title, setTitle] = useState("");
  const [customTitle, setCustomTitle] = useState("");
  const [selectedStructure, setSelectedStructure] = useState("");
  const [content, setContent] = useState("");

  const handleSaveDraft = () => {
    // Logique pour enregistrer le brouillon
    console.log("Saving draft...");
  };

  const handleSendEmail = () => {
    // Logique pour envoyer par e-mail
    console.log("Sending by email...");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin">
            <ArrowLeft className="h-5 w-5 text-gray-600 hover:text-gray-800 cursor-pointer" />
          </Link>
          <h1 className="text-3xl font-bold text-blue-600">{t("title")}</h1>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleSaveDraft}
            className="border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            <FileText className="h-4 w-4 mr-2" />
            {t("saveDraft")}
          </Button>
          <Button
            onClick={handleSendEmail}
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            <Send className="h-4 w-4 mr-2" />
            {t("sendEmail")}
          </Button>
        </div>
      </div>

      {/* Form Card */}
      <Card className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">{t("newReport")}</h2>

          <div className="space-y-6">
            {/* Title Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="report-title" className="text-sm font-semibold text-gray-700">
                  {t("reportTitle")} <span className="text-red-500">*</span>
                </Label>
                <Select value={title} onValueChange={setTitle}>
                  <SelectTrigger id="report-title">
                    <SelectValue placeholder={t("selectTemplate")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="template1">{t("template1")}</SelectItem>
                    <SelectItem value="template2">{t("template2")}</SelectItem>
                    <SelectItem value="template3">{t("template3")}</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  placeholder={t("customTitlePlaceholder")}
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  className="mt-2"
                />
              </div>

              {/* Recipient Structure */}
              <div className="space-y-2">
                <Label htmlFor="structure" className="text-sm font-semibold text-gray-700">
                  {t("recipientStructure")} <span className="text-red-500">*</span>
                </Label>
                <Select value={selectedStructure} onValueChange={setSelectedStructure}>
                  <SelectTrigger id="structure">
                    <SelectValue placeholder={t("selectStructure")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mam-soleil">MAM Soleil</SelectItem>
                    <SelectItem value="structure2">{t("structure2")}</SelectItem>
                    <SelectItem value="structure3">{t("structure3")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Report Content */}
            <div className="space-y-2">
              <Label htmlFor="content" className="text-sm font-semibold text-gray-700">
                {t("reportContent")} <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="content"
                placeholder={t("contentPlaceholder")}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[300px] resize-y"
              />
              <div className="mt-2 text-sm text-gray-600">
                <p className="font-medium mb-2">{t("exampleStructure")}</p>
                <ul className="list-disc list-inside space-y-1 text-gray-500">
                  <li>{t("example1")}</li>
                  <li>{t("example2")}</li>
                  <li>{t("example3")}</li>
                  <li>{t("example4")}</li>
                  <li>{t("example5")}</li>
                </ul>
              </div>
            </div>

            {/* Attachments */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">
                {t("attachments")} <span className="text-gray-500">({t("optional")})</span>
              </Label>
              <div className="flex items-center gap-4">
                <Button
                  type="button"
                  variant="outline"
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  <Paperclip className="h-4 w-4 mr-2" />
                  {t("addFiles")}
                </Button>
                <span className="text-sm text-gray-500">
                  {t("fileTypes")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}



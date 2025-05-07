"use client";

import { useState } from "react";
import { Card, Tabs, Form, Input, Select, Button, Radio, Space, Divider } from "antd";
import { CreditCard, Globe } from "lucide-react";
import MasterLayout from "../components/layout/MasterLayout";
import { useLocale } from '../../context/LocaleContext';

const { TabPane } = Tabs;

export default function SettingsPage() {
  const [selectedCard, setSelectedCard] = useState("visa");
  const { language, setLanguage, t } = useLocale();

  const languages = [
    { value: "en", label: "English" },
    { value: "ja", label: "日本語" },
  ];

  return (
    <MasterLayout>
      <div className="p-6">
        <h1 className="text-2xl font-semibold mb-6">{t('settings.title')}</h1>
        <div className="max-w-4xl">
          <Card className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="w-5 h-5" />
              <h2 className="text-lg font-medium">{t('settings.paymentMethods')}</h2>
            </div>
            <Form layout="vertical">
              <Form.Item label={t('settings.selectPaymentMethod')}>
                <Radio.Group value={selectedCard} onChange={(e) => setSelectedCard(e.target.value)}>
                  <Space direction="vertical">
                    <Radio value="visa">
                      <div className="flex items-center gap-2">
                        <img src="/visa.svg" alt="Visa" className="w-8 h-8" />
                        <span>{t('settings.visaEnding')}</span>
                      </div>
                    </Radio>
                    <Radio value="mastercard">
                      <div className="flex items-center gap-2">
                        <img src="/mastercard.svg" alt="Mastercard" className="w-8 h-8" />
                        <span>{t('settings.mastercardEnding')}</span>
                      </div>
                    </Radio>
                  </Space>
                </Radio.Group>
              </Form.Item>
              <Button type="primary" className="mt-4">{t('settings.addNewPaymentMethod')}</Button>
            </Form>
          </Card>

          <Card>
            <div className="flex items-center gap-2 mb-4">
              <Globe className="w-5 h-5" />
              <h2 className="text-lg font-medium">{t('settings.languageRegion')}</h2>
            </div>
            <Form layout="vertical">
              <Form.Item label={t('settings.selectLanguage')}>
                <Select
                  value={language}
                  onChange={setLanguage}
                  options={languages}
                  style={{ width: 200 }}
                />
              </Form.Item>
              <Form.Item label={t('settings.timeZone')}>
                <Select
                  defaultValue="UTC+8"
                  style={{ width: 200 }}
                  options={[
                    { value: "UTC+8", label: "Singapore (UTC+8)" },
                    { value: "UTC", label: "London (UTC)" },
                    { value: "UTC-8", label: "Los Angeles (UTC-8)" },
                    { value: "UTC+9", label: "Tokyo (UTC+9)" },
                  ]}
                />
              </Form.Item>
              <Button type="primary">{t('settings.save')}</Button>
            </Form>
          </Card>
        </div>
      </div>
    </MasterLayout>
  );
} 
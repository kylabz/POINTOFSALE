
import React, { useState } from 'react';
import { View, Button, Alert, ActivityIndicator } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

const EXCEL_URL = 'http://192.168.1.100:5002/api/sales/download-excel'; // <-- Your backend Excel endpoint

export default function DownloadSalesExcelButton() {
  const [loading, setLoading] = useState(false);

  const handleDownloadExcel = async () => {
    setLoading(true);
    try {
      const localUri = FileSystem.documentDirectory + 'sales.xlsx';
      const downloadResumable = FileSystem.createDownloadResumable(EXCEL_URL, localUri);
      const { uri } = await downloadResumable.downloadAsync();

      if (!(await Sharing.isAvailableAsync())) {
        Alert.alert('Error', 'Sharing is not available on this device.');
        setLoading(false);
        return;
      }

      await Sharing.shareAsync(uri, {
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        dialogTitle: 'Download Sales Excel',
        UTI: 'com.microsoft.excel.xlsx',
      });

      Alert.alert('Success', 'Sales Excel file downloaded and ready to open!');
    } catch (error) {
      Alert.alert('Error', 'Failed to download or open the Excel file.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Button
        title={loading ? "Downloading..." : "Download Sales (Excel)"}
        onPress={handleDownloadExcel}
        disabled={loading}
      />
      {loading && <ActivityIndicator size="large" color="#007bff" style={{ marginTop: 16 }} />}
    </View>
  );
}

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Switch, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { createAgentPreset, updateAgentPreset, AgentPresetCreate, AgentPresetUpdate, AgentPreset, getAvailableAgentTools, AgentTool } from '../../../../api/ai';

interface CreateAgentScreenProps {
  onClose: () => void;
  onSuccess: () => void;
  initialData?: AgentPreset; // Optional prop for editing
}

const CreateAgentScreen = ({ onClose, onSuccess, initialData }: CreateAgentScreenProps) => {
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [systemPrompt, setSystemPrompt] = useState(initialData?.system_prompt || '你是智能厨房管家...');
  const [selectedTools, setSelectedTools] = useState<string[]>(initialData?.allowed_tools || ['get_fridge_items', 'get_user_preferences']);
  const [isLoading, setIsLoading] = useState(false);
  const [availableTools, setAvailableTools] = useState<AgentTool[]>([]);

  useEffect(() => {
    loadTools();
  }, []);

  const loadTools = async () => {
    try {
      const tools = await getAvailableAgentTools();
      setAvailableTools(tools);
    } catch (error) {
      console.error("Failed to load tools", error);
      Alert.alert("错误", "无法加载可用工具列表");
    }
  };

  const toggleTool = (toolId: string) => {
    if (selectedTools.includes(toolId)) {
      setSelectedTools(selectedTools.filter(id => id !== toolId));
    } else {
      setSelectedTools([...selectedTools, toolId]);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('提示', '请输入智能体名称');
      return;
    }
    if (!systemPrompt.trim()) {
      Alert.alert('提示', '请输入系统提示词');
      return;
    }

    setIsLoading(true);
    try {
      if (initialData) {
        // Edit mode
        const data: AgentPresetUpdate = {
          name,
          description,
          system_prompt: systemPrompt,
          allowed_tools: selectedTools
        };
        await updateAgentPreset(initialData.id, data);
        onSuccess(); // Directly close and refresh
      } else {
        // Create mode
        const data: AgentPresetCreate = {
          name,
          description,
          system_prompt: systemPrompt,
          allowed_tools: selectedTools
        };
        await createAgentPreset(data);
        onSuccess(); // Directly close and refresh
      }
    } catch (error) {
      console.error('Failed to save agent', error);
      Alert.alert('错误', '保存失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={24} color="#1A1A1A" />
          </TouchableOpacity>
          <Text style={styles.title}>{initialData ? '编辑智能体' : '创建新智能体'}</Text>
          <TouchableOpacity onPress={handleSave} disabled={isLoading} style={styles.saveBtn}>
            {isLoading ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Text style={styles.saveText}>保存</Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} contentContainerStyle={{paddingBottom: 40}}>
          <View style={styles.section}>
            <Text style={styles.label}>名称</Text>
            <TextInput
              style={styles.input}
              placeholder="例如：川菜大师"
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>描述 (可选)</Text>
            <TextInput
              style={styles.input}
              placeholder="简短描述这个智能体的特点"
              value={description}
              onChangeText={setDescription}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>人设提示词 (System Prompt)</Text>
            <Text style={styles.helperText}>定义智能体的性格、说话方式和任务目标。</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="你是..."
              value={systemPrompt}
              onChangeText={setSystemPrompt}
              multiline
              textAlignVertical="top"
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>可用工具</Text>
            <Text style={styles.helperText}>选择该智能体可以调用的能力。</Text>
            
            <View style={styles.toolsList}>
              {availableTools.map(tool => (
                <TouchableOpacity 
                  key={tool.id} 
                  style={[
                    styles.toolItem, 
                    selectedTools.includes(tool.id) && styles.toolItemActive
                  ]}
                  onPress={() => toggleTool(tool.id)}
                >
                  <View style={{flex: 1}}>
                    <Text style={[styles.toolName, selectedTools.includes(tool.id) && styles.toolNameActive]}>
                      {tool.name}
                    </Text>
                    <Text style={styles.toolDesc}>{tool.description}</Text>
                  </View>
                  <Switch
                    value={selectedTools.includes(tool.id)}
                    onValueChange={() => toggleTool(tool.id)}
                    trackColor={{ false: "#E0E0E0", true: "#1A1A1A" }}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    backgroundColor: 'white',
  },
  closeBtn: {
    padding: 8,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  saveBtn: {
    backgroundColor: '#1A1A1A',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  saveText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  helperText: {
    fontSize: 13,
    color: '#666',
    marginBottom: 12,
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    color: '#1A1A1A',
  },
  textArea: {
    height: 120,
  },
  toolsList: {
    gap: 12,
  },
  toolItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  toolItemActive: {
    borderColor: '#1A1A1A',
    backgroundColor: '#F9F9F9',
  },
  toolName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  toolNameActive: {
    color: '#1A1A1A',
  },
  toolDesc: {
    fontSize: 12,
    color: '#666',
  },
});

export default CreateAgentScreen;

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import Markdown, { ASTNode } from 'react-native-markdown-display';

const MarkdownImage = ({ src }: { src: string }) => {
  const [aspectRatio, setAspectRatio] = React.useState(16/9);

  React.useEffect(() => {
    if (src) {
      Image.getSize(src, (width, height) => {
        if (width && height) {
          setAspectRatio(width / height);
        }
      }, (error) => {
        console.error('Failed to get image size:', error);
      });
    }
  }, [src]);

  return (
    <View style={{
        width: '100%',
        marginVertical: 10,
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: '#F0F0F0',
    }}>
      <Image
        source={{ uri: src }}
        style={{
            width: '100%',
            aspectRatio: aspectRatio,
        }}
        resizeMode="contain"
      />
    </View>
  );
};

const rules = {
  image: (node: ASTNode, children: any, parent: any, styles: any) => {
    return <MarkdownImage key={node.key} src={node.attributes.src} />;
  }
};

const ToolResultScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const { title, content } = route.params || {};

  // Pre-process content to handle HTML img tags
  // Convert <img src="..." /> to ![image](...)
  // Also handle \n newlines if they are escaped literals
  const processedContent = React.useMemo(() => {
    if (!content) return '';
    
    let newContent = content;
    
    // Replace <img src="..." ...> with markdown image syntax
    newContent = newContent.replace(/<img[^>]+src="([^"]+)"[^>]*>/g, '![image]($1)');
    newContent = newContent.replace(/<img[^>]+src='([^']+)'[^>]*>/g, '![image]($1)');
    
    // Replace literal \n with actual newlines if the content came from JSON stringify
    newContent = newContent.replace(/\\n/g, '\n');
    
    return newContent;
  }, [content]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="close" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{title || '工具结果'}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Markdown
          rules={rules}
          style={{
            body: { color: '#1A1A1A', fontSize: 16, lineHeight: 24 },
            heading1: { fontSize: 24, fontWeight: 'bold', marginVertical: 10 },
            heading2: { fontSize: 20, fontWeight: 'bold', marginVertical: 8 },
            link: { color: '#007AFF' },
            paragraph: { marginVertical: 8 },
            list_item: { marginBottom: 8 },
          }}
        >
          {processedContent || '无内容'}
        </Markdown>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
});

export default ToolResultScreen;

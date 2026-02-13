import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Keyboard, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';
import { theme } from '../../styles/theme';
import { getSearchHistory, getHotSearch, getSearchSuggestions, addSearchHistory, clearSearchHistory } from '../../../api/search';

type NavigationProp = StackNavigationProp<RootStackParamList>;

const SearchScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [searchText, setSearchText] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [hotKeywords, setHotKeywords] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [mode, setMode] = useState<'default' | 'suggest'>('default');

  const fetchInitialData = async () => {
    try {
      const [hist, hot] = await Promise.all([getSearchHistory(), getHotSearch()]);
      setHistory(hist);
      setHotKeywords(hot);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const handleSearchInput = async (text: string) => {
    setSearchText(text);
    if (text.trim().length > 0) {
      setMode('suggest');
      try {
        const sugg = await getSearchSuggestions(text);
        setSuggestions(sugg);
      } catch (e) {
        console.error(e);
      }
    } else {
      setMode('default');
      setSuggestions([]);
    }
  };

  const performSearch = async (keyword: string) => {
    if (!keyword.trim()) return;
    
    // Add to history
    try {
      await addSearchHistory(keyword);
      // Update history list locally or refetch
      const newHistory = [keyword, ...history.filter(h => h !== keyword)].slice(0, 10);
      setHistory(newHistory);
    } catch (e) {
      console.error(e);
    }

    navigation.navigate('SearchResult', { keyword });
  };

  const handleClearHistory = async () => {
    try {
      await clearSearchHistory();
      setHistory([]);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      
      {/* Header / Search Bar */}
      <View style={styles.header}>
        <View style={styles.searchBarContainer}>
          <Ionicons name="search" size={20} color={theme.colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="搜索菜谱、食材或餐厅..."
            placeholderTextColor={theme.colors.textTertiary}
            value={searchText}
            onChangeText={handleSearchInput}
            returnKeyType="search"
            onSubmitEditing={() => performSearch(searchText)}
            autoFocus
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => handleSearchInput('')}>
              <Ionicons name="close-circle" size={18} color={theme.colors.textTertiary} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.cancelButton}>
          <Text style={styles.cancelText}>取消</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {mode === 'suggest' ? (
          <View style={styles.suggestionContainer}>
            {suggestions.map((item, index) => (
              <TouchableOpacity 
                key={index} 
                style={styles.suggestionItem}
                onPress={() => performSearch(item)}
              >
                <Ionicons name="search-outline" size={18} color={theme.colors.textSecondary} style={{ marginRight: 10 }} />
                <Text style={styles.suggestionText}>{item}</Text>
              </TouchableOpacity>
            ))}
            {suggestions.length === 0 && searchText.length > 0 && (
              <View style={styles.emptySuggestion}>
                <Text style={styles.emptyText}>未找到相关内容</Text>
              </View>
            )}
          </View>
        ) : (
          <>
            {/* History Section */}
            {history.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>历史搜索</Text>
                  <TouchableOpacity onPress={handleClearHistory}>
                    <Ionicons name="trash-outline" size={18} color={theme.colors.textSecondary} />
                  </TouchableOpacity>
                </View>
                <View style={styles.chipContainer}>
                  {history.map((item, index) => (
                    <TouchableOpacity 
                      key={index} 
                      style={styles.chip}
                      onPress={() => performSearch(item)}
                    >
                      <Text style={styles.chipText}>{item}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Hot Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>热点排行</Text>
                <Ionicons name="flame" size={18} color={theme.colors.primary} />
              </View>
              <View style={styles.hotList}>
                {hotKeywords.map((item, index) => (
                  <TouchableOpacity 
                    key={index} 
                    style={styles.hotItem}
                    onPress={() => performSearch(item)}
                  >
                    <Text style={[
                      styles.hotIndex, 
                      index < 3 ? styles.hotIndexTop : styles.hotIndexNormal
                    ]}>{index + 1}</Text>
                    <Text style={styles.hotText}>{item}</Text>
                    {index < 3 && <Ionicons name="trending-up" size={14} color={theme.colors.error} style={{ marginLeft: 4 }} />}
                  </TouchableOpacity>
                ))}
                {hotKeywords.length === 0 && (
                  <Text style={styles.emptyText}>暂无热搜数据</Text>
                )}
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.screenHorizontal,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.background,
  },
  searchBarContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.md,
    height: 44, // Slightly taller
    borderRadius: 22, // Full pill
    borderWidth: 0,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  searchInput: {
    flex: 1,
    marginLeft: theme.spacing.sm,
    fontSize: 14,
    color: theme.colors.text,
    height: '100%',
    fontWeight: '600',
  },
  cancelButton: {
    marginLeft: theme.spacing.md,
    padding: 4,
  },
  cancelText: {
    fontSize: 15,
    color: theme.colors.text,
    fontWeight: '800',
    fontStyle: 'italic',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  section: {
    marginTop: theme.spacing.lg,
    paddingHorizontal: theme.spacing.screenHorizontal,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: theme.colors.text,
    fontStyle: 'italic',
    letterSpacing: 0.5,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chip: {
    backgroundColor: theme.colors.surfaceVariant,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 0,
    transform: [{ skewX: '-10deg' }],
  },
  chipText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    fontWeight: '600',
    fontStyle: 'italic',
  },
  hotList: {
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    padding: theme.spacing.md,
    borderWidth: 0,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 6,
  },
  hotItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surfaceVariant,
  },
  hotIndex: {
    width: 28,
    fontSize: 16,
    fontWeight: '900',
    textAlign: 'center',
    marginRight: 12,
    fontStyle: 'italic',
  },
  hotIndexTop: {
    color: theme.colors.primary, // Teal for top 3
    fontSize: 18,
  },
  hotIndexNormal: {
    color: theme.colors.textTertiary,
  },
  hotText: {
    fontSize: 15,
    color: theme.colors.text,
    flex: 1,
    fontWeight: '600',
  },
  suggestionContainer: {
    paddingHorizontal: theme.spacing.screenHorizontal,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  suggestionText: {
    fontSize: 15,
    color: theme.colors.text,
  },
  emptySuggestion: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    color: theme.colors.textTertiary,
    fontSize: 14,
  },
});

export default SearchScreen;

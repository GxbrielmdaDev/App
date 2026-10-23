import { Component, Fragment } from 'react';
import { Pressable, ScrollView, StatusBar, Text, View } from 'react-native';
import { DEFAULT_API_URL, DEFAULT_REPORT_URL, resetSettings } from '../services/api';

/*
 Se qualquer tela quebrar durante o render (API configurada retornando dados em formato inesperado),
 mostra uma tela de recuperação que permite restaurar as configurações padrão
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null, retryKey: 0 };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  handleRetry = () => {
    this.setState((prev) => ({ error: null, retryKey: prev.retryKey + 1 }));
  };

  handleResetAndRetry = async () => {
    try {
      await resetSettings();
    } catch {
      // se o armazenamento falhar, os padrões em memória já foram aplicados
    }
    this.handleRetry();
  };

  render() {
    const { error, retryKey } = this.state;

    if (!error) {
      return <Fragment key={retryKey}>{this.props.children}</Fragment>;
    }

    return (
      <View style={{ flex: 1, backgroundColor: '#0f0f0f' }}>
        <StatusBar style="light" />
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24, gap: 14 }}
          showsVerticalScrollIndicator={false}
        >
          <Text style={{ color: '#ffffff', fontSize: 22, fontWeight: '700' }}>
            Algo deu errado
          </Text>
          <Text style={{ color: '#b3b3b3', fontSize: 14, lineHeight: 21 }}>
            O aplicativo encontrou um erro inesperado. Isso costuma acontecer quando a API
            configurada responde com dados em outro formato.
          </Text>

          <View
            style={{
              backgroundColor: '#1a1a1a',
              borderRadius: 12,
              borderWidth: 1,
              borderColor: '#333333',
              padding: 12,
            }}
          >
            <Text style={{ color: '#ff6b6b', fontSize: 12.5 }}>
              {String(error?.message || error)}
            </Text>
          </View>

          <Pressable
            onPress={this.handleRetry}
            style={({ pressed }) => ({
              backgroundColor: pressed ? '#cc2020' : '#ff2e2e',
              borderRadius: 12,
              paddingVertical: 14,
              alignItems: 'center',
            })}
          >
            <Text style={{ color: '#ffffff', fontWeight: '700', fontSize: 15 }}>
              Tentar novamente
            </Text>
          </Pressable>

          <Pressable
            onPress={this.handleResetAndRetry}
            style={({ pressed }) => ({
              borderWidth: 1,
              borderColor: pressed ? '#b3b3b3' : '#404040',
              borderRadius: 12,
              paddingVertical: 13,
              alignItems: 'center',
            })}
          >
            <Text style={{ color: '#ffffff', fontWeight: '600', fontSize: 15 }}>
              Restaurar configurações padrão
            </Text>
          </Pressable>

          <Text style={{ color: '#666666', fontSize: 12, textAlign: 'center' }}>
            Restaurar apaga as URLs salvas e volta para {DEFAULT_API_URL} e {DEFAULT_REPORT_URL}.
          </Text>
        </ScrollView>
      </View>
    );
  }
}

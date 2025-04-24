import React, { useState } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Alert, Platform, KeyboardAvoidingView, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Cores do tema
const colors = {
  primary: '#2A5C99',
  secondary: '#4A90E2',
  accent: '#FF7D33',
  background: '#F5F7FA',
  text: '#333333',
  lightText: '#FFFFFF',
  border: '#E0E0E0',
  success: '#4CAF50',
  card: '#FFFFFF',
};

// Banco de dados em memória
let dados = {
  contatos: [
    { id: '1', nome: 'Ana', telefone: '(34) 98888-5555' },
    { id: '2', nome: 'Pedro', telefone: '(34) 99996-9999' },
    { id: '3', nome: 'Mariana', telefone: '(34) 99999-9444' },
  ],
  vendedores: ['Ana', 'Pedro', 'Mariana'],
  vendas: []
};

const precos = {
  'Casal': 120.00,
  'Individual': 70.00,
  'Jovem': 50.00,
  'Infantil': 30.00
};

// Componente de item da lista
const ContactItem = ({ nome, telefone }) => (
  <View style={styles.item}>
    <View style={styles.avatar}>
      <Ionicons name="person" size={24} color={colors.lightText} />
    </View>
    <View style={styles.contactInfo}>
      <Text style={styles.name}>{nome}</Text>
      <Text style={styles.phone}>{telefone}</Text>
    </View>
  </View>
);

// Tela Principal
function HomeScreen({ navigation }) {
  const [searchText, setSearchText] = useState('');
  const filteredData = dados.contatos.filter(item => 
    item.nome.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container} edges={['right', 'bottom', 'left']}>
        <StatusBar backgroundColor={colors.primary} barStyle="light-content" />
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Festival Carnes</Text>
            <Text style={styles.subtitle}>Controle de Vendas</Text>
          </View>
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={() => navigation.navigate('CompraIngresso')}
          >
            <Ionicons name="add" size={20} color={colors.lightText} />
            <Text style={styles.primaryButtonText}>Comprar Ingresso</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={colors.text} style={styles.searchIcon} />
          <TextInput 
            style={styles.searchInput} 
            placeholder="Buscar contato..." 
            placeholderTextColor="#999"
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>

        <FlatList
          data={filteredData}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ContactItem {...item} />}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="alert-circle" size={40} color={colors.border} />
              <Text style={styles.emptyText}>Nenhum contato encontrado</Text>
            </View>
          }
        />

        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.footerButton}
            onPress={() => navigation.navigate('Relatorios')}
          >
            <Ionicons name="bar-chart" size={24} color={colors.primary} />
            <Text style={styles.footerButtonText}>Relatórios</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

// Tela de Compra
function CompraIngresso({ navigation }) {
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [tipo, setTipo] = useState('Casal');
  const [quantidade, setQuantidade] = useState(1);
  const [vendedor, setVendedor] = useState(dados.vendedores[0]);
  const [data, setData] = useState(new Date().toLocaleDateString('pt-BR'));

  const formatarTelefone = (text) => {
    const nums = text.replace(/\D/g, '');
    let formatted = nums;
    if (nums.length > 2) formatted = `(${nums.slice(0,2)}) ${nums.slice(2)}`;
    if (nums.length > 7) formatted = `(${nums.slice(0,2)}) ${nums.slice(2,7)}-${nums.slice(7,11)}`;
    setTelefone(formatted);
  };

  const finalizarCompra = () => {
    if (!nome.trim() || telefone.replace(/\D/g, '').length < 11) {
      Alert.alert('Erro', 'Preencha nome e telefone válido (com DDD)');
      return;
    }

    const novaVenda = {
      id: Date.now().toString(),
      nome,
      telefone,
      tipo,
      quantidade,
      vendedor,
      data,
      total: precos[tipo] * quantidade
    };

    dados.vendas.push(novaVenda);
    dados.contatos.push({ id: Date.now().toString(), nome, telefone });

    Alert.alert(
      'Sucesso!',
      `Venda registrada para ${vendedor}\n${quantidade}x ${tipo}\nTotal: R$ ${(precos[tipo] * quantidade).toFixed(2)}`,
      [{ text: 'OK', onPress: () => navigation.goBack() }]
    );
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }} edges={['right', 'bottom', 'left']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{flex: 1}}
        >
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Dados da Venda</Text>
              
              <Text style={styles.label}>Data</Text>
              <TextInput
                style={styles.input}
                value={data}
                onChangeText={setData}
              />

              <Text style={styles.label}>Vendedor*</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={vendedor}
                  onValueChange={setVendedor}
                  style={styles.picker}
                >
                  {dados.vendedores.map((vendedor) => (
                    <Picker.Item key={vendedor} label={vendedor} value={vendedor} />
                  ))}
                </Picker>
              </View>
            </View>

            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Dados do Cliente</Text>
              
              <TextInput
                style={styles.input}
                placeholder="Nome completo"
                placeholderTextColor="#999"
                value={nome}
                onChangeText={setNome}
              />

              <TextInput
                style={[styles.input, { marginTop: 10 }]}
                placeholder="(00) 00000-0000"
                placeholderTextColor="#999"
                value={telefone}
                onChangeText={formatarTelefone}
                keyboardType="phone-pad"
                maxLength={15}
              />
            </View>

            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Ingresso</Text>
              
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={tipo}
                  onValueChange={setTipo}
                  style={styles.picker}
                >
                  {Object.entries(precos).map(([key, valor]) => (
                    <Picker.Item 
                      key={key} 
                      label={`${key} - R$ ${valor.toFixed(2)}`} 
                      value={key} 
                    />
                  ))}
                </Picker>
              </View>

              <View style={[styles.pickerContainer, { marginTop: 10 }]}>
                <Picker
                  selectedValue={quantidade}
                  onValueChange={setQuantidade}
                  style={styles.picker}
                >
                  {[1].map(num => (
                    <Picker.Item key={num} label={`${num} unidade(s)`} value={num} />
                  ))}
                </Picker>
              </View>
            </View>

            <TouchableOpacity 
              style={styles.confirmButton}
              onPress={finalizarCompra}
            >
              <Text style={styles.confirmButtonText}>REGISTRAR VENDA</Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

// Tela de Relatórios
function RelatoriosScreen() {
  const totalVendas = dados.vendas.reduce((sum, venda) => sum + venda.total, 0);
  
  const vendasPorVendedor = dados.vendas.reduce((acc, venda) => {
    acc[venda.vendedor] = (acc[venda.vendedor] || 0) + venda.total;
    return acc;
  }, {});

  const vendasPorTipo = dados.vendas.reduce((acc, venda) => {
    acc[venda.tipo] = (acc[venda.tipo] || 0) + venda.quantidade;
    return acc;
  }, {});

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }} edges={['right', 'bottom', 'left']}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Card Resumo Geral */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="stats-chart" size={24} color={colors.primary} />
              <Text style={styles.sectionTitle}>Resumo Geral</Text>
            </View>
            
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Total Vendido:</Text>
              <Text style={styles.summaryValue}>R$ {totalVendas.toFixed(2)}</Text>
            </View>
            
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Vendas Registradas:</Text>
              <Text style={styles.summaryValue}>{dados.vendas.length}</Text>
            </View>
          </View>

          {/* Card por Vendedor */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="people" size={24} color={colors.primary} />
              <Text style={styles.sectionTitle}>Por Vendedor</Text>
            </View>
            {Object.entries(vendasPorVendedor).map(([vendedor, total]) => (
              <View key={vendedor} style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>{vendedor}</Text>
                <Text style={styles.summaryValue}>R$ {total.toFixed(2)}</Text>
              </View>
            ))}
          </View>

          {/* Card por Tipo */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="ticket" size={24} color={colors.primary} />
              <Text style={styles.sectionTitle}>Por Tipo</Text>
            </View>
            {Object.entries(vendasPorTipo).map(([tipo, qtd]) => (
              <View key={tipo} style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>{tipo}</Text>
                <Text style={styles.summaryValue}>{qtd} un.</Text>
              </View>
            ))}
          </View>

          {/* Histórico */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="time" size={24} color={colors.primary} />
              <Text style={styles.sectionTitle}>Últimas Vendas</Text>
            </View>
            {dados.vendas.slice().reverse().slice(0, 5).map(venda => (
              <View key={venda.id} style={styles.saleItem}>
                <View style={styles.saleHeader}>
                  <Text style={styles.saleDate}>{venda.data}</Text>
                  <Text style={styles.saleSeller}>{venda.vendedor}</Text>
                </View>
                  <Text style={styles.saleClient}>
                  {venda.nome} - {venda.telefone}
                  </Text>
                  <Text style={styles.saleClient}>
                  {venda.quantidade}x {venda.tipo}
                  </Text>
                <Text style={styles.saleTotal}>
                  R$ {venda.total.toFixed(2)}
                </Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

// Navegação
const Stack = createStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen 
            name="Home" 
            component={HomeScreen} 
            options={{ headerShown: false }} 
          />
          <Stack.Screen 
            name="CompraIngresso" 
            component={CompraIngresso}
            options={{ 
              title: 'Nova Venda',
              headerStyle: { backgroundColor: colors.primary },
              headerTintColor: colors.lightText,
              headerTitleStyle: { fontWeight: 'bold' },
            }}
          />
          <Stack.Screen 
            name="Relatorios" 
            component={RelatoriosScreen}
            options={{ 
              title: 'Relatórios',
              headerStyle: { backgroundColor: colors.primary },
              headerTintColor: colors.lightText,
              headerTitleStyle: { fontWeight: 'bold' },
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: colors.background, 
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 80,
    backgroundColor: colors.background
  },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginBottom: 20,
    paddingTop: 16
  },
  title: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: colors.primary 
  },
  subtitle: {
    fontSize: 14,
    color: colors.text,
    opacity: 0.7
  },
  primaryButton: { 
    backgroundColor: colors.primary, 
    paddingHorizontal: 16, 
    paddingVertical: 10,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  primaryButtonText: { 
    color: colors.lightText, 
    fontWeight: 'bold',
    fontSize: 14,
    marginLeft: 8
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  searchIcon: {
    marginRight: 8
  },
  searchInput: {
    flex: 1,
    height: 40,
    color: colors.text,
    ...Platform.select({
      ios: {
        paddingVertical: 8,
      },
    }),
  },
  listContent: {
    paddingBottom: 80
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40
  },
  emptyText: {
    color: colors.text,
    opacity: 0.5,
    marginTop: 10,
    fontSize: 16
  },
  item: {
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  avatar: {
    backgroundColor: colors.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12
  },
  contactInfo: {
    flex: 1
  },
  name: { 
    color: colors.text, 
    fontSize: 16, 
    fontWeight: 'bold' 
  },
  phone: { 
    color: colors.text,
    opacity: 0.7,
    fontSize: 14,
    marginTop: 2
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 12,
    backgroundColor: colors.card,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  footerButton: { 
    alignItems: 'center',
    padding: 8
  },
  footerButtonText: {
    color: colors.primary,
    fontSize: 12,
    marginTop: 4
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8
  },
  label: {
    color: colors.text,
    opacity: 0.8,
    marginBottom: 6,
    fontSize: 14
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        paddingVertical: 12,
      },
      android: {
        paddingVertical: 8,
      },
    }),
  },
  pickerContainer: {
    backgroundColor: colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
    overflow: 'hidden'
  },
  picker: {
    height: Platform.OS === 'ios' ? 200 : 48,
    color: colors.text
  },
  confirmButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  confirmButtonText: {
    color: colors.lightText,
    fontWeight: 'bold',
    fontSize: 16
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12
  },
  summaryLabel: {
    color: colors.text,
    opacity: 0.8,
    fontSize: 15
  },
  summaryValue: {
    color: colors.primary,
    fontWeight: 'bold',
    fontSize: 15
  },
  saleItem: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 12,
    marginBottom: 12
  },
  saleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4
  },
  saleDate: {
    color: colors.text,
    opacity: 0.8,
    fontSize: 14
  },
  saleSeller: {
    color: colors.primary,
    fontWeight: 'bold',
    fontSize: 14
  },
  saleClient: {
    color: colors.text,
    fontSize: 14,
    marginBottom: 4
  },
  saleTotal: {
    color: colors.success,
    fontWeight: 'bold',
    fontSize: 15
  }
});

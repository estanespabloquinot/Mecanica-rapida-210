"use client"

import { useState, useEffect } from "react"
import { View, Text, TextInput, Button, StyleSheet, ScrollView, Alert } from "react-native"
import { DatabaseService } from "../services/DatabaseService"

const ChecklistScreen = ({ route }) => {
  const { placa } = route.params
  const [km, setKm] = useState("")
  const [itensMaintenance, setItensMaintenance] = useState("")
  const [checklist, setChecklist] = useState([])
  const [proximasTrocas, setProximasTrocas] = useState(null)

  useEffect(() => {
    carregarDadosVeiculo()
  }, [])

  const carregarDadosVeiculo = async () => {
    try {
      const { veiculo, proximasTrocas } = await DatabaseService.getProximasTrocas(placa)
      setKm(veiculo.km_atual.toString())
      setProximasTrocas(proximasTrocas)
    } catch (error) {
      console.error("Erro ao carregar dados do veículo:", error)
      Alert.alert("Erro", "Não foi possível carregar os dados do veículo.")
    }
  }

  const adicionarItem = () => {
    if (itensManutencao.trim() !== "") {
      setChecklist([...checklist, { item: itensManutencao, status: null }])
      setItensManutencao("")
    }
  }

  const atualizarStatus = (index, status) => {
    const novoChecklist = [...checklist]
    novoChecklist[index].status = status
    setChecklist(novoChecklist)
  }

  const verificarAlertas = () => {
    const kmAtual = Number.parseInt(km)
    const alertas = []

    if (proximasTrocas) {
      if (kmAtual >= proximasTrocas.motor) {
        alertas.push("Troca de óleo do motor vencida!")
      } else if (kmAtual >= proximasTrocas.motor - 2000) {
        alertas.push("Faltam menos de 2000 km para a troca de óleo do motor.")
      }

      if (kmAtual >= proximasTrocas.cambio) {
        alertas.push("Troca de óleo do câmbio vencida!")
      } else if (kmAtual >= proximasTrocas.cambio - 2000) {
        alertas.push("Faltam menos de 2000 km para a troca de óleo do câmbio.")
      }

      if (kmAtual >= proximasTrocas.diferencial) {
        alertas.push("Troca de óleo do diferencial vencida!")
      } else if (kmAtual >= proximasTrocas.diferencial - 2000) {
        alertas.push("Faltam menos de 2000 km para a troca de óleo do diferencial.")
      }
    }

    return alertas
  }

  const salvarChecklist = async () => {
    try {
      await DatabaseService.updateKmAtual(placa, Number.parseInt(km))
      await DatabaseService.addChecklist({
        placa_id: placa,
        data: new Date().toISOString(),
        km: Number.parseInt(km),
        itens_manutencao: checklist.map((item) => item.item),
        status: checklist.map((item) => item.status),
      })
      Alert.alert("Sucesso", "Checklist salvo com sucesso!")
      // Recarregar dados do veículo após salvar
      carregarDadosVeiculo()
    } catch (error) {
      console.error("Erro ao salvar checklist:", error)
      Alert.alert("Erro", "Não foi possível salvar o checklist. Tente novamente.")
    }
  }

  const alertas = verificarAlertas()

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Checklist - {placa}</Text>
      <TextInput
        style={styles.input}
        placeholder="KM atual do veículo"
        value={km}
        onChangeText={setKm}
        keyboardType="numeric"
      />
      {alertas.length > 0 && (
        <View style={styles.alertContainer}>
          {alertas.map((alerta, index) => (
            <Text key={index} style={styles.alertText}>
              {alerta}
            </Text>
          ))}
        </View>
      )}
      <View style={styles.addItemContainer}>
        <TextInput
          style={[styles.input, styles.addItemInput]}
          placeholder="Adicionar item de manutenção"
          value={itensManutencao}
          onChangeText={setItensManutencao}
        />
        <Button title="+" onPress={adicionarItem} />
      </View>
      {checklist.map((item, index) => (
        <View key={index} style={styles.checklistItem}>
          <Text>{item.item}</Text>
          <View style={styles.buttonGroup}>
            <Button
              title="Sim"
              onPress={() => atualizarStatus(index, "Sim")}
              color={item.status === "Sim" ? "green" : undefined}
            />
            <Button
              title="Não"
              onPress={() => atualizarStatus(index, "Não")}
              color={item.status === "Não" ? "red" : undefined}
            />
          </View>
        </View>
      ))}
      <Button title="Salvar Checklist" onPress={salvarChecklist} />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  addItemContainer: {
    flexDirection: "row",
    marginBottom: 12,
  },
  addItemInput: {
    flex: 1,
    marginRight: 8,
  },
  checklistItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  buttonGroup: {
    flexDirection: "row",
  },
  alertContainer: {
    backgroundColor: "#FFEBEE",
    padding: 10,
    borderRadius: 5,
    marginBottom: 12,
  },
  alertText: {
    color: "#D32F2F",
    fontSize: 14,
  },
})

export default ChecklistScreen
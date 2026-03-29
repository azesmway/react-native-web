import { StatusBar } from 'expo-status-bar'
import React, { useState } from 'react'
import { Image, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'

import profizon from '../images/profizon.png'

// Иконки (для web используем эмодзи, для нативных платформ можно установить react-native-vector-icons)
const Icon = ({ name, size = 24, color = '#000' }) => {
  const icons = {
    apple: '🍎',
    google: 'G',
    phone: '📱',
    city: '🏙️',
    user: '👤',
    email: '✉️',
    arrow: '→',
    check: '✓'
  }

  return <Text style={{ fontSize: size, color }}>{icons[name] || name}</Text>
}

function Profizon(props) {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [formData, setFormData] = useState({
    phone: '',
    city: '',
    firstName: '',
    lastName: '',
    email: '',
    agency: ''
  })

  const handleSocialLogin = provider => {
    console.log(`Login with ${provider}`)
    // Имитация успешной авторизации
    setIsLoggedIn(true)
  }

  const handleSubmitProfile = () => {
    console.log('Profile data:', formData)
    // Здесь будет отправка данных на сервер
    alert('Профиль успешно сохранен!')
  }

  if (!isLoggedIn) {
    return <OnboardingScreen onSocialLogin={handleSocialLogin} />
  }

  return <ProfileScreen formData={formData} setFormData={setFormData} onSubmit={handleSubmitProfile} />
}

// Экран 1: Онбординг / Вход
const OnboardingScreen = ({ onSocialLogin }) => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Image source={profizon} style={{ width: 50, height: 50 }} />
          <View style={{ justifyContent: 'center', marginLeft: 10 }}>
            <Text style={styles.logo}>PROFIZON</Text>
          </View>
        </View>

        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>Профессиональный {'\n'}чат для турагентов</Text>

          <View style={styles.featureGrid}>
            <FeatureCard icon="💬" title="Мгновенные чаты" description="Общайтесь с коллегами и партнерами в реальном времени" />
            <FeatureCard icon="🌎" title="Глобальное сообщество" description="Тысячи агентов со всего мира уже с нами" />
            <FeatureCard icon="🔒" title="Безопасно и надежно" description="Защищенное соединение и конфиденциальность данных" />
            <FeatureCard icon="📊" title="Обмен опытом" description="Делитесь инсайтами и находите лучшие предложения" />
          </View>

          <View style={styles.descriptionBox}>
            <Text style={styles.descriptionTitle}>Создано для профессионалов туризма</Text>
            <Text style={styles.descriptionText}>
              Profizon — это эксклюзивное пространство для туристических агентов, где вы можете обсуждать актуальные предложения, делиться опытом, находить надежных партнеров и оперативно
              решать рабочие вопросы. Присоединяйтесь к сообществу профессионалов уже сегодня!
            </Text>
          </View>
        </View>

        <View style={styles.loginSection}>
          <Text style={styles.loginTitle}>Начните работу</Text>
          <Text style={styles.loginSubtitle}>Войдите, чтобы присоединиться к сообществу</Text>

          <TouchableOpacity style={[styles.socialButton, styles.googleButton]} onPress={() => onSocialLogin('google')} activeOpacity={0.9}>
            <Icon name="email" size={20} color="#fff" />
            <Text style={styles.socialButtonText}>Авторизоваться</Text>
          </TouchableOpacity>

          {/*<TouchableOpacity style={[styles.socialButton, styles.appleButton]} onPress={() => onSocialLogin('apple')} activeOpacity={0.9}>*/}
          {/*  <Icon name="apple" size={20} color="#fff" />*/}
          {/*  <Text style={styles.socialButtonText}>Продолжить с Apple</Text>*/}
          {/*</TouchableOpacity>*/}

          <Text style={styles.termsText}>Продолжая, вы соглашаетесь с Условиями использования и Политикой конфиденциальности</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

// Компонент карточки функции
const FeatureCard = ({ icon, title, description }) => (
  <View style={styles.featureCard}>
    <Text style={styles.featureIcon}>{icon}</Text>
    <Text style={styles.featureTitle}>{title}</Text>
    <Text style={styles.featureDescription}>{description}</Text>
  </View>
)

// Экран 2: Заполнение профиля
const ProfileScreen = ({ formData, setFormData, onSubmit }) => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Image source={profizon} style={{ width: 50, height: 50 }} />
          <View style={{ justifyContent: 'center', marginLeft: 10 }}>
            <Text style={styles.logo}>PROFIZON</Text>
          </View>
        </View>

        <View style={styles.progressBar}>
          <View style={[styles.progressStep, styles.progressStepActive]} />
          <View style={styles.progressStep} />
          <View style={styles.progressStep} />
        </View>

        <View style={styles.profileSection}>
          <Text style={styles.profileTitle}>Завершите регистрацию</Text>
          <Text style={styles.profileSubtitle}>Расскажите немного о себе, чтобы коллеги могли вас узнать</Text>

          <View style={styles.formCard}>
            <Text style={styles.formSectionTitle}>Контактные данные</Text>

            <InputField
              icon="phone"
              label="Номер телефона"
              placeholder="+7 (999) 999-99-99"
              value={formData.phone}
              onChangeText={text => setFormData({ ...formData, phone: text })}
              keyboardType="phone-pad"
            />

            <InputField
              icon="email"
              label="Email"
              placeholder="example@travelagency.com"
              value={formData.email}
              onChangeText={text => setFormData({ ...formData, email: text })}
              keyboardType="email-address"
            />

            <Text style={styles.formSectionTitle}>Личная информация</Text>

            <View style={styles.rowInputs}>
              <View style={styles.halfInput}>
                <InputField icon="user" label="Имя" placeholder="Анна" value={formData.firstName} onChangeText={text => setFormData({ ...formData, firstName: text })} />
              </View>
              <View style={styles.halfInput}>
                <InputField icon="user" label="Фамилия" placeholder="Петрова" value={formData.lastName} onChangeText={text => setFormData({ ...formData, lastName: text })} />
              </View>
            </View>

            <InputField icon="city" label="Город" placeholder="Москва" value={formData.city} onChangeText={text => setFormData({ ...formData, city: text })} />

            <InputField icon="🏢" label="Название агентства (необязательно)" placeholder="Pegas Touristik" value={formData.agency} onChangeText={text => setFormData({ ...formData, agency: text })} />

            <TouchableOpacity style={styles.submitButton} onPress={onSubmit} activeOpacity={0.9}>
              <Text style={styles.submitButtonText}>Сохранить и продолжить</Text>
              <Icon name="arrow" size={20} color="#fff" />
            </TouchableOpacity>

            <Text style={styles.verificationNote}>
              <Icon name="check" size={16} color="#4CAF50" /> На указанный номер будет отправлен код подтверждения
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

// Компонент поля ввода
const InputField = ({ icon, label, placeholder, value, onChangeText, keyboardType = 'default' }) => (
  <View style={styles.inputContainer}>
    <Text style={styles.inputLabel}>{label}</Text>
    <View style={styles.inputWrapper}>
      <Icon name={icon} size={20} color="#666" style={styles.inputIcon} />
      <TextInput style={styles.input} placeholder={placeholder} placeholderTextColor="#999" value={value} onChangeText={onChangeText} keyboardType={keyboardType} />
    </View>
  </View>
)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC'
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40
  },
  header: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'web' ? 40 : 20,
    paddingBottom: 20
  },
  logo: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    letterSpacing: -0.5
  },
  heroSection: {
    paddingHorizontal: 24,
    marginBottom: 40
  },
  heroTitle: {
    fontSize: Platform.OS === 'web' ? 48 : 30,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: Platform.OS === 'web' ? 56 : 44,
    marginBottom: 32,
    letterSpacing: -1,
    textAlign: 'center'
  },
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
    marginBottom: 32
  },
  featureCard: {
    width: Platform.OS === 'web' ? '25%' : '50%',
    paddingHorizontal: 8,
    marginBottom: 16
  },
  featureIcon: {
    fontSize: 32,
    marginBottom: 12
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4
  },
  featureDescription: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20
  },
  descriptionBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  descriptionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 12
  },
  descriptionText: {
    fontSize: 16,
    color: '#475569',
    lineHeight: 24
  },
  loginSection: {
    paddingHorizontal: 24,
    alignItems: 'center'
  },
  loginTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8
  },
  loginSubtitle: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 32
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    maxWidth: 400,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2
  },
  googleButton: {
    backgroundColor: '#DB4437'
  },
  appleButton: {
    backgroundColor: '#000000'
  },
  socialButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12
  },
  termsText: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    maxWidth: 400,
    marginTop: 24
  },

  // Стили для экрана профиля
  progressBar: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 8
  },
  progressStep: {
    flex: 1,
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2
  },
  progressStepActive: {
    backgroundColor: '#3B82F6'
  },
  profileSection: {
    paddingHorizontal: 24
  },
  profileTitle: {
    marginTop: 20,
    fontSize: 26,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
    letterSpacing: -0.5
  },
  profileSubtitle: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 32
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    maxWidth: 600,
    alignSelf: 'center',
    width: '100%'
  },
  formSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 16,
    marginTop: 8
  },
  inputContainer: {
    marginBottom: 20
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#475569',
    marginBottom: 6
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 16
  },
  inputIcon: {
    marginRight: 12
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: '#0F172A',
    outlineStyle: 'none',
    ...(Platform.OS === 'web' ? { outline: 'none' } : {})
  },
  rowInputs: {
    flexDirection: 'row',
    marginHorizontal: -8
  },
  halfInput: {
    flex: 1,
    marginHorizontal: 8
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 16,
    marginTop: 24,
    marginBottom: 16,
    gap: 8,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600'
  },
  verificationNote: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center'
  }
})

export default Profizon

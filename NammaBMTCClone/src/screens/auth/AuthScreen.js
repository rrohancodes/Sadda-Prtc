import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Layout } from '../../constants/Layout';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';

export default function AuthScreen({ navigation }) {
  const { login, register } = useAuth();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name:'', email:'', phone:'', password:'' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { t } = useTranslation();

  const switchMode = () => { setError(''); setMode(m => m==='login'?'register':'login'); };

  const validate = () => {
    if (mode==='register') {
      if (!form.name.trim()) return t('auth.errors.nameRequired');
      if (!form.email && !form.phone) return t('auth.errors.emailOrPhone');
      if (form.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) return t('auth.errors.invalidEmail');
      if (form.phone && form.phone.length < 8) return t('auth.errors.phoneShort');
      if (form.password.length < 6) return t('auth.errors.passwordMin');
    } else {
      if (!form.password) return t('auth.errors.passwordRequired');
      if (!form.email && !form.phone) return t('auth.errors.emailOrPhone');
    }
    return '';
  };

  const handleSubmit = async () => {
    setError('');
    const v = validate();
    if (v) { setError(v); return; }
    setLoading(true);
    try {
      if (mode==='login') {
        const res = await login({ email: form.email || undefined, phone: form.phone || undefined, password: form.password });
        if (!res.success) setError(t('auth.errors.loginFailed')); else navigation.goBack();
      } else {
        const res = await register({ name: form.name, email: form.email || undefined, phone: form.phone || undefined, password: form.password });
        if (!res.success) setError(t('auth.errors.registerFailed')); else navigation.goBack();
      }
    } catch (e) {
      setError(e.message.replace('API request failed with status','Status'));
    } finally { setLoading(false); }
  };

  const onChange = (k,v)=> setForm(f=>({...f,[k]:v}));

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS==='ios'?'padding':'height'} style={{flex:1}}>
        <View style={styles.card}>
          <Text style={styles.title}>{mode==='login'? t('auth.welcomeBack') : t('auth.createAccount')}</Text>
          <Text style={styles.subtitle}>{mode==='login'? t('auth.signInToContinue') : t('auth.registerToStart')}</Text>

          {error? <Text style={styles.error}>{error}</Text>:null}

            {mode==='register' && (
              <TextInput
                placeholder={t('auth.placeholders.name')}
                style={styles.input}
                value={form.name}
                onChangeText={(t)=>onChange('name',t)}
                autoCapitalize='words'
              />
            )}
            <TextInput
              placeholder={t('auth.placeholders.email')}
              style={styles.input}
              value={form.email}
              onChangeText={(t)=>onChange('email',t.trim())}
              autoCapitalize='none'
              keyboardType='email-address'
            />
            <TextInput
              placeholder={t('auth.placeholders.phone')}
              style={styles.input}
              value={form.phone}
              onChangeText={(t)=>onChange('phone',t.replace(/[^0-9+]/g,''))}
              keyboardType='phone-pad'
            />
            <TextInput
              placeholder={t('auth.placeholders.password')}
              style={styles.input}
              value={form.password}
              onChangeText={(t)=>onChange('password',t)}
              secureTextEntry
            />

          <TouchableOpacity style={styles.primaryBtn} onPress={handleSubmit} disabled={loading}>
            {loading? <ActivityIndicator color={Colors.textLight}/> : <Text style={styles.btnText}>{mode==='login'? t('auth.signIn') : t('auth.register')}</Text>}
          </TouchableOpacity>

          <TouchableOpacity style={styles.modeSwitch} onPress={switchMode} disabled={loading}>
            <Text style={styles.modeSwitchText}>{mode==='login'? t('auth.switchToRegister') : t('auth.switchToLogin')}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.backBtn} onPress={()=> navigation.goBack()} disabled={loading}>
            <Text style={styles.backText}>{t('auth.cancel')}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:{ flex:1, justifyContent:'center', padding:24, backgroundColor:Colors.background },
  card:{ backgroundColor:Colors.surface, borderRadius:16, padding:24, shadowColor:'#000', shadowOpacity:0.1, shadowRadius:8, elevation:4 },
  title:{ fontSize:24, fontWeight:'700', color:Colors.text, marginBottom:4, textAlign:'center' },
  subtitle:{ fontSize:14, color:Colors.textSecondary, marginBottom:16, textAlign:'center' },
  error:{ backgroundColor:'#fdd', color:Colors.error, padding:8, borderRadius:8, marginBottom:12, textAlign:'center' },
  input:{ backgroundColor:Colors.background, borderRadius:10, paddingHorizontal:14, paddingVertical:12, marginBottom:12, fontSize:15, color:Colors.text, borderWidth:1, borderColor:Colors.border },
  primaryBtn:{ backgroundColor:Colors.primary, marginTop:8, paddingVertical:14, borderRadius:10, alignItems:'center' },
  btnText:{ color:Colors.textLight, fontWeight:'600', fontSize:16 },
  modeSwitch:{ marginTop:20 },
  modeSwitchText:{ textAlign:'center', color:Colors.info, fontSize:14, fontWeight:'500' },
  backBtn:{ marginTop:12, alignItems:'center' },
  backText:{ color:Colors.textSecondary, fontSize:14 }
});

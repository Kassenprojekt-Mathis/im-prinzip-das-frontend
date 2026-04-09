// ViewModel für Login
import { useState } from 'react'
import { userApi } from '../api/userAPI'

export function useLogin() {
  const [selectedUsername, setSelectedUsername] = useState('')
  const [password, setPassword] = useState('')
  const [employeeList, setEmployeeList] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // Mitarbeiter-Liste vom Backend
  const loadEmployees = async () => {
    try {
      const data = await userApi.getUsers()
      setEmployeeList(data)
    } catch (err) {
      console.error('Fehler beim Laden der Mitarbeiter:', err)
      setError('Fehler beim Laden der Mitarbeiterliste')
    }
  }

  const resetForm = () => {
    setSelectedUsername('')
    setPassword('')
    setError('')
  }

  const login = async (onSuccess) => {
    setError('')

    if (!selectedUsername || !password.trim()) {
      setError('Bitte füllen Sie alle Felder aus')
      return
    }

    setIsLoading(true)
    try {
      const user = await userApi.anmelden(selectedUsername, password)
      resetForm()
      onSuccess(user.mitarbeiter.benutzername)
    } catch (err) {
      setError(err.message || 'Login fehlgeschlagen')
    } finally {
      setIsLoading(false)
    }
  }

  const cancelLogin = (onCancel) => {
    resetForm()
    onCancel()
  }

  return {
    selectedUsername,
    setSelectedUsername,
    password,
    setPassword,
    employeeList,
    isLoading,
    error,
    loadEmployees,
    login,
    cancelLogin
  }
}

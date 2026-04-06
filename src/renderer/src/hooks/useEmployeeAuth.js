// Das ViewModel
import { useState } from 'react'
import { userApi } from '../api/userAPI'

export function useEmployeeAuth() {
  const [benutzername, setBenutzername] = useState('')
  const [passwort, setPasswort] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const resetForm = () => {
    setBenutzername('')
    setPasswort('')
    setError('')
  }

  const anmelden = async (onSuccess) => {
    setError('')

    if (!benutzername.trim()) {
      setError('Bitte geben Sie einen Benutzernamen ein')
      return
    }
    if (!passwort.trim()) {
      setError('Bitte geben Sie Ihre PIN ein')
      return
    }

    setIsLoading(true)
    try {
      const user = await userApi.anmelden(benutzername, passwort)
      resetForm()
      onSuccess({ userId: user.id, userName: user.benutzername })
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const abbrechen = (onCancel) => {
    resetForm()
    onCancel()
  }

  return {
    benutzername,
    setBenutzername,
    passwort,
    setPasswort,
    isLoading,
    error,
    anmelden,
    abbrechen
  }
}

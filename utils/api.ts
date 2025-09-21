import { supabase } from './supabase/client'
import { projectId, publicAnonKey } from './supabase/info'
import { Subscription, PaymentCard } from '../types/subscription'

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-0908dc3b`

class ApiService {
  private async getAuthHeaders() {
    const { data: { session } } = await supabase.auth.getSession()
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session?.access_token || publicAnonKey}`
    }
  }

  private async handleResponse(response: Response) {
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }))
      throw new Error(error.error || `HTTP ${response.status}`)
    }
    return response.json()
  }

  // Auth methods
  async signUp(email: string, password: string, name?: string) {
    const response = await fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`
      },
      body: JSON.stringify({ email, password, name })
    })
    return this.handleResponse(response)
  }

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    if (error) throw new Error(error.message)
    return data
  }

  async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw new Error(error.message)
  }

  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  }

  // Subscription methods
  async getSubscriptions(): Promise<Subscription[]> {
    const headers = await this.getAuthHeaders()
    const response = await fetch(`${API_BASE}/subscriptions`, { headers })
    const data = await this.handleResponse(response)
    return data.subscriptions || []
  }

  async createSubscription(subscription: Omit<Subscription, 'id'>): Promise<Subscription> {
    const headers = await this.getAuthHeaders()
    const response = await fetch(`${API_BASE}/subscriptions`, {
      method: 'POST',
      headers,
      body: JSON.stringify(subscription)
    })
    const data = await this.handleResponse(response)
    return data.subscription
  }

  async updateSubscription(subscription: Subscription): Promise<Subscription> {
    const headers = await this.getAuthHeaders()
    const response = await fetch(`${API_BASE}/subscriptions/${subscription.id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(subscription)
    })
    const data = await this.handleResponse(response)
    return data.subscription
  }

  async deleteSubscription(id: string): Promise<void> {
    const headers = await this.getAuthHeaders()
    const response = await fetch(`${API_BASE}/subscriptions/${id}`, {
      method: 'DELETE',
      headers
    })
    await this.handleResponse(response)
  }

  // Payment card methods
  async getCards(): Promise<PaymentCard[]> {
    const headers = await this.getAuthHeaders()
    const response = await fetch(`${API_BASE}/cards`, { headers })
    const data = await this.handleResponse(response)
    return data.cards || []
  }

  async createCard(card: Omit<PaymentCard, 'id' | 'dateAdded'>): Promise<PaymentCard> {
    const headers = await this.getAuthHeaders()
    const response = await fetch(`${API_BASE}/cards`, {
      method: 'POST',
      headers,
      body: JSON.stringify(card)
    })
    const data = await this.handleResponse(response)
    return data.card
  }

  async updateCard(card: PaymentCard): Promise<PaymentCard> {
    const headers = await this.getAuthHeaders()
    const response = await fetch(`${API_BASE}/cards/${card.id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(card)
    })
    const data = await this.handleResponse(response)
    return data.card
  }

  async deleteCard(id: string): Promise<void> {
    const headers = await this.getAuthHeaders()
    const response = await fetch(`${API_BASE}/cards/${id}`, {
      method: 'DELETE',
      headers
    })
    await this.handleResponse(response)
  }

  // Sync methods
  async syncData(): Promise<{ subscriptions: Subscription[], cards: PaymentCard[], user: any }> {
    const headers = await this.getAuthHeaders()
    const response = await fetch(`${API_BASE}/sync`, { headers })
    return this.handleResponse(response)
  }

  async uploadData(subscriptions: Subscription[], cards: PaymentCard[]): Promise<void> {
    const headers = await this.getAuthHeaders()
    const response = await fetch(`${API_BASE}/sync`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ subscriptions, cards })
    })
    await this.handleResponse(response)
  }
}

export const api = new ApiService()
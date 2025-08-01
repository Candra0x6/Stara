import { CVData, CVFileWithSections } from './cv-database.service'

export interface CVFile {
  id: string
  name: string
  data: CVData
  createdAt: Date
  updatedAt: Date
  isPublic: boolean
  templateId?: string
  version: number
}

export class CVApiService {
  private baseUrl = '/api/cv-files'

  // Get all CV files for the current user
  async getAllFiles(): Promise<CVFile[]> {
    try {
      const response = await fetch(this.baseUrl)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      return data.cvFiles.map(this.transformFileResponse)
    } catch (error) {
      console.error('Error fetching CV files:', error)
      throw new Error('Failed to fetch CV files')
    }
  }

  // Get a specific CV file
  async getFile(id: string): Promise<CVFile | null> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`)
      
      if (response.status === 404) {
        return null
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      return this.transformFileResponse(data.cvFile)
    } catch (error) {
      console.error('Error fetching CV file:', error)
      throw new Error('Failed to fetch CV file')
    }
  }

  // Create a new CV file
  async createFile(name: string, data: CVData, templateId?: string): Promise<CVFile> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, data, templateId }),
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const responseData = await response.json()
      return this.transformFileResponse(responseData.cvFile)
    } catch (error) {
      console.error('Error creating CV file:', error)
      throw new Error('Failed to create CV file')
    }
  }

  // Update an existing CV file
  async updateFile(
    id: string, 
    updates: Partial<{ name: string; data: CVData; isPublic: boolean }>
  ): Promise<CVFile> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      return this.transformFileResponse(data.cvFile)
    } catch (error) {
      console.error('Error updating CV file:', error)
      throw new Error('Failed to update CV file')
    }
  }

  // Delete a CV file
  async deleteFile(id: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'DELETE',
      })
      
      if (response.status === 404) {
        return false
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      return true
    } catch (error) {
      console.error('Error deleting CV file:', error)
      return false
    }
  }

  // Duplicate a CV file
  async duplicateFile(id: string, newName: string): Promise<CVFile> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}/duplicate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newName }),
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      return this.transformFileResponse(data.cvFile)
    } catch (error) {
      console.error('Error duplicating CV file:', error)
      throw new Error('Failed to duplicate CV file')
    }
  }

  // Share a CV file
  async shareFile(
    id: string, 
    shareWithEmail: string, 
    permissions: 'VIEW' | 'EDIT' = 'VIEW'
  ): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ shareWithEmail, permissions }),
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      return data.shareToken
    } catch (error) {
      console.error('Error sharing CV file:', error)
      throw new Error('Failed to share CV file')
    }
  }

  // Get shared CV file by token
  async getSharedFile(shareToken: string): Promise<CVFile | null> {
    try {
      const response = await fetch(`${this.baseUrl}/share?token=${shareToken}`)
      
      if (response.status === 404) {
        return null
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      return this.transformFileResponse(data.cvFile)
    } catch (error) {
      console.error('Error fetching shared CV file:', error)
      throw new Error('Failed to fetch shared CV file')
    }
  }

  // Auto-save functionality
  async autoSave(id: string, data: CVData): Promise<void> {
    try {
      // Use a debounced approach for auto-save
      await this.updateFile(id, { data })
    } catch (error) {
      console.error('Auto-save failed:', error)
      // Don't throw error for auto-save failures to avoid disrupting user experience
    }
  }

  // Export CV file as JSON
  async exportFile(id: string): Promise<Blob> {
    try {
      const file = await this.getFile(id)
      if (!file) {
        throw new Error('File not found')
      }

      const exportData = {
        ...file,
        exportedAt: new Date().toISOString(),
        version: '1.0'
      }

      return new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      })
    } catch (error) {
      console.error('Error exporting CV file:', error)
      throw new Error('Failed to export CV file')
    }
  }

  // Import CV file from JSON
  async importFile(file: File): Promise<CVFile> {
    try {
      const text = await file.text()
      const importData = JSON.parse(text)
      
      // Validate imported data structure
      if (!importData.name || !importData.data) {
        throw new Error('Invalid file format')
      }

      // Create new file with imported data
      const newName = `${importData.name} (Imported)`
      return await this.createFile(newName, importData.data)
    } catch (error) {
      console.error('Error importing CV file:', error)
      throw new Error('Failed to import CV file')
    }
  }

  // Helper method to transform API response
  private transformFileResponse(file: CVFileWithSections): CVFile {
    return {
      id: file.id,
      name: file.name,
      data: file.data,
      createdAt: new Date(file.createdAt),
      updatedAt: new Date(file.updatedAt),
      isPublic: file.isPublic,
      templateId: file.templateId,
      version: file.version
    }
  }

  // Helper method to get default CV data
  getDefaultCVData(): CVData {
    return {
      personalInfo: {
        name: '',
        email: '',
        phone: '',
        location: '',
        summary: ''
      },
      experience: [],
      education: [],
      skills: [],
      languages: [],
      certifications: []
    }
  }

  // Generate a unique name for new files
  generateFileName(baseName: string = 'New CV'): string {
    const timestamp = new Date().toISOString().slice(0, 16).replace('T', ' ')
    return `${baseName} - ${timestamp}`
  }
}

// Export singleton instance
export const cvApiService = new CVApiService()

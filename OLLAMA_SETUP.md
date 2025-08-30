# Ollama + IBM Granite Integration Setup Guide

This guide explains how to set up and use the local Ollama instance with IBM Granite model for AI-powered profile analysis in your financial application.

## 🎯 **Overview**

The Profile Analysis feature connects to your local Ollama instance running the IBM Granite model to provide comprehensive financial analysis and recommendations based on your profile and financial data.

## 🔧 **Prerequisites**

### **1. Install Ollama**
First, install Ollama on your system:

**Windows:**
```bash
# Download from https://ollama.ai/download
# Or use winget
winget install Ollama.Ollama
```

**macOS:**
```bash
# Download from https://ollama.ai/download
# Or use Homebrew
brew install ollama
```

**Linux:**
```bash
curl -fsSL https://ollama.ai/install.sh | sh
```

### **2. Start Ollama Service**
```bash
# Start Ollama service
ollama serve
```

### **3. Pull IBM Granite Model**
```bash
# Pull the IBM Granite model
ollama run hf.co/ibm-granite/granite-8b-code-base-4k-GGUF
```

## 🚀 **Setup Steps**

### **1. Verify Ollama Installation**
```bash
# Check if Ollama is running
ollama list

# Test the API
curl http://localhost:11434/api/tags
```

### **2. Pull the Granite Model**
```bash
# Pull the IBM Granite model (this may take a while)
ollama pull hf.co/ibm-granite/granite-8b-code-base-4k-GGUF

# Verify the model is available
ollama list
```

### **3. Test the Model**
```bash
# Test the model with a simple prompt
ollama run hf.co/ibm-granite/granite-8b-code-base-4k-GGUF "Hello, can you help me with financial planning?"
```

## 📋 **Feature Capabilities**

### **🤖 AI-Powered Analysis**
- **Comprehensive Profile Analysis**: Deep analysis of user profile and financial data
- **Personalized Recommendations**: Tailored advice based on individual circumstances
- **Risk Assessment**: Professional risk evaluation and management strategies
- **Action Plans**: Step-by-step implementation guidance
- **Financial Health Metrics**: Detailed analysis of financial wellness

### **📊 Analysis Types**
- **Comprehensive Analysis**: Full financial profile review
- **Investment Analysis**: Portfolio and investment strategy review
- **Risk Analysis**: Risk tolerance and management assessment
- **Goals Analysis**: Financial goal planning and prioritization
- **Cash Flow Analysis**: Income, expenses, and cash flow optimization

## 🔄 **Integration Flow**

### **1. User Triggers Analysis**
```typescript
// User clicks "AI Profile Analysis" button
const handleProfileAnalysis = async () => {
  // Test Ollama connection
  const isConnected = await testOllamaConnection();
  
  // Check Granite model availability
  const hasGraniteModel = await checkGraniteModel();
  
  // Perform analysis
  const analysis = await analyzeProfile({
    userProfile,
    financialData,
    analysisType: 'comprehensive'
  });
};
```

### **2. Ollama Processing**
```typescript
// Send request to local Ollama instance
const response = await sendToOllama({
  model: 'hf.co/ibm-granite/granite-8b-code-base-4k-GGUF',
  prompt: enhancedPrompt,
  stream: false,
  options: {
    temperature: 0.7,
    num_predict: 2048,
  }
});
```

### **3. Response Display**
- **Real-time Analysis**: Live AI response display
- **Formatted Output**: Markdown-formatted analysis
- **Actionable Insights**: Clear recommendations and next steps

## 🎨 **User Interface**

### **Profile Analysis Button**
- **Location**: Profile screen, next to "Save Profile" button
- **Function**: Triggers AI analysis of user profile and financial data
- **States**: Loading, analyzing, completed, error

### **Analysis Results Panel**
- **Expandable Panel**: Shows/hides analysis results
- **Scrollable Content**: Handles long analysis responses
- **Close Button**: Allows users to hide results
- **Loading Indicator**: Shows analysis progress

## 🔒 **Security & Privacy**

### **Local Processing**
- **No External APIs**: All processing happens locally
- **Data Privacy**: No data sent to external services
- **Offline Capability**: Works without internet connection
- **User Control**: Complete control over data and processing

### **Model Security**
- **Local Model**: IBM Granite model runs on your machine
- **No Data Transmission**: No data leaves your system
- **Secure Processing**: All analysis done locally

## 🛠 **Configuration Options**

### **Ollama API Settings**
```typescript
// Default configuration
const OLLAMA_BASE_URL = 'http://localhost:11434';
const GRANITE_MODEL = 'hf.co/ibm-granite/granite-8b-code-base-4k-GGUF';

// Model parameters
const options = {
  temperature: 0.7,        // Creativity vs. consistency
  top_p: 0.9,             // Nucleus sampling
  top_k: 40,              // Top-k sampling
  num_predict: 2048,      // Maximum response length
};
```

### **Analysis Parameters**
```typescript
// Analysis types available
type AnalysisType = 'comprehensive' | 'investment' | 'risk' | 'goals' | 'cashflow';

// Request structure
interface ProfileAnalysisRequest {
  userProfile: any;
  financialData?: any;
  analysisType: AnalysisType;
}
```

## 🧪 **Testing & Validation**

### **1. Connection Test**
```typescript
// Test Ollama connection
const isConnected = await testOllamaConnection();
console.log('Ollama connected:', isConnected);
```

### **2. Model Availability Test**
```typescript
// Check if Granite model is available
const hasGraniteModel = await checkGraniteModel();
console.log('Granite model available:', hasGraniteModel);
```

### **3. Analysis Test**
```typescript
// Test profile analysis
const analysis = await analyzeProfile({
  userProfile: testProfile,
  financialData: testFinancialData,
  analysisType: 'comprehensive'
});
console.log('Analysis result:', analysis);
```

## 📈 **Performance Optimization**

### **1. Model Management**
- **Model Loading**: Granite model loads on first use
- **Memory Usage**: Monitor system memory usage
- **Response Time**: Typical response time: 5-15 seconds
- **Caching**: Consider caching frequent analyses

### **2. Resource Management**
- **CPU Usage**: Model inference uses CPU/GPU resources
- **Memory Allocation**: Ensure sufficient RAM for model
- **Concurrent Requests**: Limit simultaneous analysis requests

### **3. Response Optimization**
- **Streaming**: Consider streaming responses for long analyses
- **Progressive Loading**: Show partial results as they generate
- **Timeout Handling**: Implement request timeouts

## 🚨 **Troubleshooting**

### **Common Issues**

#### **1. Ollama Not Running**
```
Error: Ollama is not running
```
**Solution**: Start Ollama service with `ollama serve`

#### **2. Model Not Found**
```
Error: IBM Granite model not found
```
**Solution**: Pull the model with `ollama pull hf.co/ibm-granite/granite-8b-code-base-4k-GGUF`

#### **3. Connection Refused**
```
Error: Connection refused to localhost:11434
```
**Solution**: Check if Ollama is running and accessible

#### **4. Model Loading Issues**
```
Error: Model failed to load
```
**Solution**: Check system resources and model file integrity

### **Debug Commands**
```bash
# Check Ollama status
ollama list

# Check model details
ollama show hf.co/ibm-granite/granite-8b-code-base-4k-GGUF

# Test model directly
ollama run hf.co/ibm-granite/granite-8b-code-base-4k-GGUF "Test prompt"

# Check Ollama logs
ollama logs
```

## 📚 **API Documentation**

### **Ollama API Endpoints**
```typescript
// Generate response
POST /api/generate
{
  "model": "hf.co/ibm-granite/granite-8b-code-base-4k-GGUF",
  "prompt": "Your prompt here",
  "stream": false,
  "options": {
    "temperature": 0.7,
    "num_predict": 2048
  }
}

// List models
GET /api/tags

// Pull model
POST /api/pull
{
  "name": "hf.co/ibm-granite/granite-8b-code-base-4k-GGUF"
}
```

### **Service Functions**
```typescript
// Main analysis function
analyzeProfile(request: ProfileAnalysisRequest): Promise<string>

// Connection testing
testOllamaConnection(): Promise<boolean>
checkGraniteModel(): Promise<boolean>

// Model management
getAvailableModels(): Promise<string[]>
pullGraniteModel(): Promise<boolean>
```

## 🔮 **Future Enhancements**

### **Planned Features**
- **Streaming Responses**: Real-time analysis display
- **Multiple Models**: Support for different AI models
- **Analysis History**: Save and compare analyses
- **Export Reports**: Generate PDF analysis reports
- **Custom Prompts**: User-defined analysis prompts

### **Integration Opportunities**
- **Batch Analysis**: Analyze multiple profiles
- **Comparative Analysis**: Compare different scenarios
- **Trend Analysis**: Track changes over time
- **Automated Insights**: Scheduled analysis reports

## 📞 **Support & Resources**

### **Ollama Resources**
- [Ollama Documentation](https://ollama.ai/docs)
- [Ollama GitHub](https://github.com/ollama/ollama)
- [Model Library](https://ollama.ai/library)

### **IBM Granite Resources**
- [IBM Granite Models](https://huggingface.co/ibm-granite)
- [Granite Documentation](https://www.ibm.com/granite)
- [Model Specifications](https://huggingface.co/ibm-granite/granite-8b-code-base-4k-GGUF)

### **Application Support**
- **Setup Help**: Check Ollama installation and model availability
- **Connection Issues**: Verify Ollama service is running
- **Performance Issues**: Monitor system resources
- **Model Issues**: Check model file integrity and compatibility

---

**Note**: This integration provides powerful local AI analysis capabilities. Ensure you have sufficient system resources (RAM, CPU/GPU) for optimal performance with the IBM Granite model.

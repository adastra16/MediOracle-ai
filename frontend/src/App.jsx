import { useState, useCallback } from 'react';

// Simple test first
function App() {
  const [currentView, setCurrentView] = useState('home');

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-100">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-pink-200 px-6 py-4">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-400 to-pink-500 flex items-center justify-center shadow-lg">
              <span className="text-xl">🔬</span>
            </div>
            <span className="font-bold text-xl bg-gradient-to-r from-pink-500 to-pink-600 bg-clip-text text-transparent">
              MediOracle AI
            </span>
          </div>
          <div className="flex gap-2">
            {['home', 'query', 'symptoms'].map((view) => (
              <button
                key={view}
                onClick={() => setCurrentView(view)}
                className={`px-4 py-2 rounded-xl transition-all ${
                  currentView === view
                    ? 'bg-pink-500 text-white'
                    : 'bg-pink-100 text-pink-600 hover:bg-pink-200'
                }`}
              >
                {view.charAt(0).toUpperCase() + view.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-24 px-4 pb-16">
        {currentView === 'home' && <HeroSection onGetStarted={() => setCurrentView('query')} />}
        {currentView === 'query' && <QuerySection />}
        {currentView === 'symptoms' && <SymptomsSection />}
      </main>
    </div>
  );
}

function HeroSection({ onGetStarted }) {
  return (
    <section className="min-h-[80vh] flex flex-col items-center justify-center text-center">
      {/* Decorative background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-pink-300/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-pink-400/20 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full bg-white/60 backdrop-blur border border-pink-200/50 shadow-lg">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-sm font-medium text-gray-600">AI-Powered Healthcare Assistant</span>
        </div>

        {/* Title */}
        <h1 className="text-5xl md:text-7xl font-bold mb-6">
          <span className="bg-gradient-to-r from-pink-500 via-pink-600 to-purple-600 bg-clip-text text-transparent">
            MediOracle AI
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-xl md:text-2xl text-gray-600 mb-8">
          Intelligent Healthcare Assistant
        </p>

        <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-12">
          Experience the future of medical information with our intelligent RAG-powered assistant.
          Upload documents, ask questions, and get AI-enhanced insights.
        </p>

        {/* CTA Button */}
        <button
          onClick={onGetStarted}
          className="px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-pink-500 to-pink-600 rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
        >
          🔬 Ask a Medical Question
        </button>

        {/* Trust indicators */}
        <div className="mt-16 flex flex-wrap justify-center gap-6">
          {[
            { icon: '🔒', label: 'Privacy First' },
            { icon: '⚡', label: 'Real-time AI' },
            { icon: '📚', label: 'RAG Enhanced' },
            { icon: '🏥', label: 'Medical Grade' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/50 backdrop-blur border border-pink-100">
              <span className="text-xl">{item.icon}</span>
              <span className="text-sm font-medium text-gray-600">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Medical Disclaimer */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 max-w-xl">
        <div className="px-4 py-2 rounded-xl bg-pink-50/80 border border-pink-200/50 text-xs text-pink-700">
          ⚠️ For educational purposes only. Not a substitute for professional medical advice.
        </div>
      </div>
    </section>
  );
}

function QuerySection() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState(null);


  const handleFileUpload = async (file) => {
    if (!file || file.type !== 'application/pdf') {
      setError('Please upload a PDF file');
      return;
    }

    setUploading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/rag/ingest', {
        method: 'POST',
        body: formData,
      });

      const json = await response.json();
      
      if (json.success) {
        setUploadedFile({
          name: file.name,
          size: file.size,
          uploadedAt: new Date(),
        });
        setError(null);
      } else {
        setError(json.error || 'Failed to upload PDF');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError('Failed to upload PDF. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    if (!uploadedFile) {
      setError('Please upload a PDF document first');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/rag/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      const json = await response.json();
      
      if (json.success) {
        const data = json.data || json;
        setResult(data);
      } else {
        setError(json.error || 'Failed to process query');
      }
    } catch (err) {
      console.error('Query error:', err);
      setError('Failed to process query. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClearFile = () => {
    setUploadedFile(null);
    setResult(null);
    setQuery('');
    setError(null);
    fetch('/api/rag/clear', { method: 'DELETE' }).catch(console.error);
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Card */}
      <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-pink-200/30 p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-pink-400 to-pink-500 flex items-center justify-center shadow-lg">
            <span className="text-3xl">🔬</span>
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-pink-600 bg-clip-text text-transparent neon-blue">
            Ask Medical Questions
          </h2>
          <p className="text-gray-500 mt-2">Upload a medical PDF and ask questions about it</p>
        </div>

        {/* Disclaimer */}
        <div className="mb-6 p-4 rounded-xl bg-pink-50 border border-pink-200/50">
          <p className="text-sm text-pink-700">
            ⚠️ <strong>Medical Disclaimer:</strong> This information is for educational purposes only and is NOT a substitute for professional medical advice.
          </p>
        </div>

        {/* PDF Upload Section */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-600 mb-2">
            Upload Medical PDF Document <span className="text-red-500">*</span>
          </label>
          
          {!uploadedFile ? (
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
                dragActive ? 'border-pink-500 bg-pink-50' : 'border-pink-300 bg-pink-50/30'
              } ${uploading ? 'opacity-50 pointer-events-none' : 'hover:border-pink-400 hover:bg-pink-50'}`}
            >
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileInput}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={uploading}
              />
              
              {uploading ? (
                <div className="space-y-3">
                  <div className="w-12 h-12 mx-auto border-4 border-pink-300 border-t-pink-500 rounded-full animate-spin" />
                  <p className="text-gray-600">Uploading and processing PDF...</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="w-16 h-16 mx-auto rounded-xl bg-pink-100 flex items-center justify-center">
                    <span className="text-3xl">📄</span>
                  </div>
                  <div>
                    <p className="text-gray-700 font-medium">Drag & drop PDF here</p>
                    <p className="text-sm text-gray-500 mt-1">or click to browse</p>
                  </div>
                  <p className="text-xs text-gray-400">PDF files only</p>
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-green-50 border border-green-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">✅</span>
                <div>
                  <p className="font-medium text-gray-800">{uploadedFile.name}</p>
                  <p className="text-xs text-gray-500">
                    {(uploadedFile.size / 1024).toFixed(1)} KB • Uploaded
                  </p>
                </div>
              </div>
              <button
                onClick={handleClearFile}
                className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                Remove
              </button>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Query Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Your Medical Question</label>
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type your health-related question here... (e.g., 'What are the symptoms of this condition?')"
              rows={4}
              disabled={!uploadedFile}
              className="w-full px-4 py-3 rounded-xl border-2 border-pink-200 focus:border-pink-400 focus:ring-4 focus:ring-pink-100 transition-all resize-none disabled:opacity-50 disabled:cursor-not-allowed"
            />
            {!uploadedFile && (
              <p className="mt-1 text-xs text-gray-500">Please upload a PDF document first</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !query.trim() || !uploadedFile || uploading}
            className="w-full py-4 text-lg font-semibold text-white bg-gradient-to-r from-pink-500 to-pink-600 rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Searching...
              </span>
            ) : (
              '🔍 Ask Question'
            )}
          </button>
        </form>

        {/* Results */}
        {result && (
          <div className="mt-8 p-6 rounded-xl bg-white border border-pink-200/50 animate-slide-up">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <span>🤖</span> AI Response
            </h3>
            {result.error ? (
              <p className="text-red-500">{result.error}</p>
            ) : (
              <div className="prose prose-pink max-w-none">
                <div className="text-gray-700 whitespace-pre-wrap mb-4">{result.response}</div>
                {result.sourcesUsed && result.sourcesUsed.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-pink-100">
                    <p className="text-sm font-medium text-gray-600 mb-2">📚 Sources from uploaded document:</p>
                    {result.sourcesUsed.map((src, i) => (
                      <div key={i} className="text-sm text-gray-500 mb-1 p-2 rounded bg-pink-50">
                        • {src.source} {src.similarity && `(${Math.round(parseFloat(src.similarity) * 100)}% match)`}
                        {src.excerpt && (
                          <p className="text-xs text-gray-400 mt-1 italic line-clamp-2">{src.excerpt}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                {result.sourcesUsed && result.sourcesUsed.length === 0 && (
                  <div className="mt-4 pt-4 border-t border-pink-100">
                    <p className="text-sm text-amber-600 italic">
                      ⚠️ The uploaded document does not contain information about this topic.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function SymptomsSection() {
  const [symptoms, setSymptoms] = useState([]);
  const [customSymptom, setCustomSymptom] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [duration, setDuration] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);


  const symptomOptions = [
    { icon: '🤒', label: 'Fever', value: 'fever' },
    { icon: '🤕', label: 'Headache', value: 'headache' },
    { icon: '😷', label: 'Cough', value: 'cough' },
    { icon: '🤢', label: 'Nausea', value: 'nausea' },
    { icon: '😴', label: 'Fatigue', value: 'fatigue' },
    { icon: '💔', label: 'Chest Pain', value: 'chest pain' },
    { icon: '🤧', label: 'Runny Nose', value: 'runny nose' },
    { icon: '😵', label: 'Dizziness', value: 'dizziness' },
  ];

  const toggleSymptom = (value) => {
    setSymptoms(prev => 
      prev.includes(value) ? prev.filter(s => s !== value) : [...prev, value]
    );
  };

  const handleAnalyze = async () => {
    if (!customSymptom.trim()) {
      setError('Please describe your symptoms in detail');
      return;
    }
    
    // Combine text description with selected emoji symptoms
    let allSymptoms = [customSymptom.trim()];
    if (symptoms.length > 0) {
      // Add selected emoji symptoms to the description
      allSymptoms = [customSymptom.trim() + '. Also experiencing: ' + symptoms.join(', '), ...symptoms];
    }
    
    if (!age || age < 0 || age > 150) {
      setError('Please enter a valid age');
      return;
    }
    
    if (!gender) {
      setError('Please select gender');
      return;
    }
    
    if (!duration || duration < 0) {
      setError('Please enter duration of symptoms in days');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/rag/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          symptoms: allSymptoms,
          age: parseInt(age),
          gender: gender,
          duration: parseInt(duration)
        }),
      });
      const json = await response.json();
      
      if (json.success) {
        setResult(json.data || json);
      } else {
        setError(json.error || 'Failed to analyze symptoms');
      }
    } catch (err) {
      console.error('Analysis error:', err);
      setError('Failed to analyze symptoms. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-pink-200/30 p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-pink-400 to-pink-500 flex items-center justify-center shadow-lg">
            <span className="text-3xl">🩺</span>
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-pink-600 bg-clip-text text-transparent neon-blue">
            Symptom Analyzer
          </h2>
          <p className="text-gray-500 mt-2">Select symptoms for educational health assessment</p>
        </div>

        {/* Disclaimer */}
        <div className="mb-6 p-4 rounded-xl bg-pink-50 border border-pink-200/50">
          <p className="text-sm text-pink-700">
            ⚠️ <strong>Important:</strong> This tool provides educational information only. Always consult a healthcare professional.
          </p>
        </div>

        {/* Patient Information */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Age <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="Enter age"
              min="0"
              max="150"
              required
              className="w-full px-4 py-3 rounded-xl border-2 border-pink-200 focus:border-pink-400 focus:ring-4 focus:ring-pink-100 transition-all"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Gender <span className="text-red-500">*</span>
            </label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border-2 border-pink-200 focus:border-pink-400 focus:ring-4 focus:ring-pink-100 transition-all"
            >
              <option value="">Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Duration (Days) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="Days"
              min="0"
              required
              className="w-full px-4 py-3 rounded-xl border-2 border-pink-200 focus:border-pink-400 focus:ring-4 focus:ring-pink-100 transition-all"
            />
          </div>
        </div>

        {/* Symptom buttons */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-600 mb-3">
            Select Symptoms <span className="text-gray-400 text-xs">(Optional)</span>
          </label>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
            {symptomOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => toggleSymptom(opt.value)}
                className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all ${
                  symptoms.includes(opt.value)
                    ? 'bg-gradient-to-br from-pink-400 to-pink-500 text-white shadow-lg scale-105'
                    : 'bg-white border border-pink-200 text-gray-700 hover:border-pink-400'
                }`}
              >
                <span className="text-2xl">{opt.icon}</span>
                <span className="text-xs font-medium">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Custom symptoms */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-600 mb-2">
            Describe Your Symptoms <span className="text-red-500">*</span>
          </label>
          <textarea
            value={customSymptom}
            onChange={(e) => setCustomSymptom(e.target.value)}
            placeholder="Describe your symptoms in detail (e.g., fever for 3 days, headache in the morning, feeling nauseous after meals)"
            required
            rows="4"
            className="w-full px-4 py-3 rounded-xl border-2 border-pink-200 focus:border-pink-400 focus:ring-4 focus:ring-pink-100 transition-all"
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <button
          onClick={handleAnalyze}
          disabled={loading || !customSymptom.trim() || !age || !gender || !duration}
          className="w-full py-4 text-lg font-semibold text-white bg-gradient-to-r from-pink-500 to-pink-600 rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all interactive-button glow-on-hover"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Analyzing...
            </span>
          ) : (
            '🔬 Analyze Symptoms'
          )}
        </button>

        {/* Results */}
        {result && !result.error && (
          <div className="mt-8 space-y-4 animate-slide-up">
            {/* Emergency Alert */}
            {(result.risk_level === 'CRITICAL' || result.risk_level === 'EMERGENCY') && (
              <div className="p-4 rounded-xl bg-red-100 border-2 border-red-500 animate-pulse">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🚨</span>
                  <div>
                    <h4 className="font-bold text-red-800 text-lg">EMERGENCY - Seek Immediate Medical Care</h4>
                    <p className="text-sm text-red-700 mt-1">Based on your symptoms, immediate medical attention is recommended.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Severity */}
            {result.severity_score !== undefined && (
              <div className="p-4 rounded-xl bg-white border border-pink-200/50">
                <div className="flex justify-between mb-2">
                  <span className="font-medium text-gray-700">Severity Score</span>
                  <span className="font-bold text-pink-600">{result.severity_score}/100</span>
                </div>
                <div className="h-3 bg-pink-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ${
                      result.severity_score >= 70 ? 'bg-red-500' :
                      result.severity_score >= 50 ? 'bg-orange-500' :
                      result.severity_score >= 30 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${result.severity_score}%` }}
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Risk Level: <strong className={
                    result.risk_level === 'CRITICAL' || result.risk_level === 'EMERGENCY' ? 'text-red-600' :
                    result.risk_level === 'HIGH' ? 'text-orange-600' :
                    result.risk_level === 'MODERATE' ? 'text-yellow-600' : 'text-green-600'
                  }>{result.risk_level}</strong>
                </p>
              </div>
            )}

            {/* Conditions */}
            {result.possible_conditions && result.possible_conditions.length > 0 && (
              <div className="p-4 rounded-xl bg-white border border-pink-200/50">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-pink-600">✓</span>
                  <h4 className="font-semibold text-gray-800">Possible Conditions</h4>
                  <span className="text-sm text-gray-500">(Based on your symptoms)</span>
                </div>
                <div className="space-y-2">
                  {result.possible_conditions.map((cond, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-pink-500 text-white flex items-center justify-center text-sm font-semibold">
                        {i + 1}
                      </span>
                      <div className="flex-1">
                        <div className="flex justify-between items-start gap-2">
                          <span className="font-medium text-gray-800">{cond.condition.replace(/⚠️|EMERGENCY:/g, '').trim()}</span>
                          {cond.confidence !== undefined && (
                            <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
                              {Math.round(cond.confidence * 100)}%
                            </span>
                          )}
                        </div>
                        {cond.rationale && (
                          <p className="text-xs text-gray-500 mt-1">{cond.rationale}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {result.recommendations && (
              <div className="p-4 rounded-xl bg-pink-50 border border-pink-200/50">
                <h4 className="font-semibold text-pink-700 mb-2">💡 Recommendations</h4>
                <ul className="space-y-1">
                  {result.recommendations.map((rec, i) => (
                    <li key={i} className="text-sm text-gray-600">• {rec}</li>
                  ))}
                </ul>
              </div>
            )}
        </div>
        )}

        {result?.error && (
          <div className="mt-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-600">
            {result.error}
          </div>
        )}
        </div>
    </div>
  );
}

export default App;

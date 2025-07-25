import React, { useState } from 'react';
import { Button } from './components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Badge } from './components/ui/badge';
import { Separator } from './components/ui/separator';
import { Checkbox } from './components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from './components/ui/radio-group';
import { Label } from './components/ui/label';
import { Shield, Check, TrendingUp, Users, Award, MessageCircle, BookOpen, FileCheck, BarChart3, TrendingDown, Menu, X } from 'lucide-react';
import { motion, useInView, useAnimation } from 'framer-motion';
import { useRef, useEffect } from 'react';
import headerImage from 'figma:asset/4cb053fdd0ec2caa41ce2a486b41adbeb35f4eea.png';
import serviceExampleImage from 'figma:asset/ad7a2e415cb9f2124586f4c2622cb23a4810ae71.png';
import taxReturnImage from 'figma:asset/39b362c7f87cb5bd4dabed955630639350e9ee88.png';
import bookkeepingImage from 'figma:asset/9400dfec02a7efa4228dd8cb91e2ea73a0116147.png';
import consultationTypingImage from 'figma:asset/da9046bd154d5c5d5aa6fe24c018c917a876e21c.png';
import financialReportImage from 'figma:asset/e728ecb4de244760020b86d2b77a5b765e0354f4.png';
import taxInfoImage from 'figma:asset/a9b71790fa3ee174a78b94516fae902ecdf2dced.png';
import costComparisonImage from 'figma:asset/ffa1313b831c91b7fd993875c36797edf13b3a21.png';
import logoIcon from 'figma:asset/f61847a1dbd23fa996bfe1c02497b7daaec5b407.png';

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

const fadeInLeft = {
  hidden: { opacity: 0, x: -60 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

const fadeInRight = {
  hidden: { opacity: 0, x: 60 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.5, ease: "easeOut" }
  }
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.2
    }
  }
};

// Custom hook for scroll animations
const useScrollAnimation = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, threshold: 0.1 });
  const controls = useAnimation();

  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }
  }, [isInView, controls]);

  return { ref, controls };
};

// Counter animation component
const AnimatedCounter = ({ value, suffix = "" }: { value: string; suffix?: string }) => {
  const { ref, controls } = useScrollAnimation();
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    if (controls) {
      const numericValue = parseInt(value.replace(/[^0-9]/g, ''));
      let startTime: number;
      const duration = 2000; // 2 seconds

      const animate = (currentTime: number) => {
        if (!startTime) startTime = currentTime;
        const progress = Math.min((currentTime - startTime) / duration, 1);
        
        setCount(Math.floor(progress * numericValue));

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      requestAnimationFrame(animate);
    }
  }, [controls, value]);

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={fadeInUp}
      className="text-4xl text-gray-600 mb-2"
    >
      {count}{suffix}
    </motion.div>
  );
};

export default function App() {
  const [isTermsAgreed, setIsTermsAgreed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMobileMenuOpen(false); // Close mobile menu after navigation
    }
  };

  const handleApplicationSubmitNoTax = () => {
    if (!isTermsAgreed) {
      alert('利用規約への同意が必要です。');
      return;
    }
    alert('消費税申告なしプランでお申し込みありがとうございます。担当者より連絡いたします。');
  };

  const handleApplicationSubmitWithTax = () => {
    if (!isTermsAgreed) {
      alert('利用規約への同意が必要です。');
      return;
    }
    alert('消費税申告ありプランでお申し込みありがとうございます。担当者より連絡いたします。');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-gray-700 text-white sticky top-0 z-50 shadow-md"
      >
        <div className="max-w-7xl mx-auto px-[4vw] sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <motion.div 
              className="flex items-center gap-[2vw] sm:space-x-3"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <div className="w-[8vw] h-[8vw] min-w-[32px] max-w-[48px] min-h-[32px] max-h-[48px] sm:w-12 sm:h-12 bg-white bg-opacity-10 rounded-lg flex items-center justify-center p-1 sm:p-2">
                <img 
                  src={logoIcon} 
                  alt="みんなの税務顧問ロゴ" 
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h1 className="text-[3.5vw] sm:text-base lg:text-lg min-text-[14px] max-text-[18px]">みんなの税務顧問</h1>
              </div>
            </motion.div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex space-x-6 xl:space-x-8">
              <motion.button 
                onClick={() => scrollToSection('services')} 
                className="hover:text-gray-200 transition-colors text-sm xl:text-base"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                サービス内容
              </motion.button>
              <motion.button 
                onClick={() => scrollToSection('plans')} 
                className="hover:text-gray-200 transition-colors text-sm xl:text-base"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                料金
              </motion.button>
              <motion.button 
                onClick={() => scrollToSection('cost-comparison')} 
                className="hover:text-gray-200 transition-colors text-sm xl:text-base"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                コスト比較
              </motion.button>
            </nav>

            {/* Desktop CTA Button */}
            <motion.div className="hidden sm:block" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                onClick={() => scrollToSection('contact')}
                className="bg-yellow-400 text-black hover:bg-yellow-500 text-xs sm:text-sm px-3 sm:px-4 py-2"
              >
                申込はこちら
              </Button>
            </motion.div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6 text-white" />
              ) : (
                <Menu className="w-6 h-6 text-white" />
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden border-t border-gray-600 py-[2vw]"
            >
              <nav className="flex flex-col gap-4">
                <button 
                  onClick={() => scrollToSection('services')} 
                  className="text-left hover:text-gray-200 transition-colors py-2"
                >
                  サービス内容
                </button>
                <button 
                  onClick={() => scrollToSection('plans')} 
                  className="text-left hover:text-gray-200 transition-colors py-2"
                >
                  料金
                </button>
                <button 
                  onClick={() => scrollToSection('cost-comparison')} 
                  className="text-left hover:text-gray-200 transition-colors py-2"
                >
                  コスト比較
                </button>
                <Button 
                  onClick={() => scrollToSection('contact')}
                  className="bg-yellow-400 text-black hover:bg-yellow-500 mt-4 w-full"
                >
                  申込はこちら
                </Button>
              </nav>
            </motion.div>
          )}
        </div>
      </motion.header>

      {/* Hero Image */}
      <motion.section 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="w-full overflow-hidden"
      >
        <div className="w-full flex justify-center aspect-[16/9] sm:aspect-auto">
          <img 
            src={headerImage} 
            alt="みんなの税務顧問ヘッダー" 
            className="w-full h-full object-cover sm:object-contain lg:max-w-full lg:h-auto"
          />
        </div>
      </motion.section>

      {/* About Section */}
      <section className="py-[8vw] sm:py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-[4vw] sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-[8vw] sm:mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, threshold: 0.1 }}
            variants={fadeInUp}
          >
            <h2 className="text-[6vw] sm:text-3xl lg:text-4xl mb-[4vw] sm:mb-8 min-text-[24px] max-text-[32px]">みんなの税務顧問とは？</h2>
          </motion.div>
          
          <motion.div 
            className="max-w-4xl mx-auto"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, threshold: 0.1 }}
            variants={staggerContainer}
          >
            <motion.div className="flex flex-col gap-[4vw] sm:space-y-8" variants={fadeInUp}>
              <div className="text-[4vw] sm:text-lg leading-relaxed text-gray-700 min-text-[16px] max-text-[18px]">
                <p className="mb-[3vw] sm:mb-6">
                  個人事業主やスタートアップなど小規模なビジネスを営む多くの方が、税に関する悩みを抱えながらも、費用の関係から税務顧問を諦め、たった一人で奮闘している現状があります。
                </p>
                <p className="mb-[3vw] sm:mb-6">
                  私たちはそんな「挑戦するすべての人」を応援したい。
                </p>
                <p className="mb-[4vw] sm:mb-8">
                  事業の規模に関わらず、すべての事業者が安心して本業に集中できる環境を創りたいという想いから、年商1,000万円以下の事業者に特化した、<span className="text-gray-700 font-semibold">顧問料980円</span>の税務顧問サービス「みんなの税務顧問」をスタートします。
                </p>
              </div>
              
              <motion.div 
                className="bg-gray-50 p-[4vw] sm:p-8 rounded-xl"
                variants={scaleIn}
                whileHover={{ scale: 1.02 }}
              >
                <div className="text-[4vw] sm:text-lg leading-relaxed text-gray-700 min-text-[16px] max-text-[18px]">
                  <p className="mb-[2vw] sm:mb-4">
                    最新のAIを駆使し、内部の業務を最大限まで効率化したことで、従来の税理士業界ではありえなかった金額でのサービス提供が実現しました。
                  </p>
                  <p>
                    これまで経済的な理由で専門家のサポートを諦めていた方々に、圧倒的な低価格で「税理士がついている安心感」を届けます。
                  </p>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-[8vw] sm:py-16 lg:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-[4vw] sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-[8vw] sm:mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, threshold: 0.1 }}
            variants={fadeInUp}
          >
            <h2 className="text-[6vw] sm:text-3xl lg:text-4xl mb-4 min-text-[24px] max-text-[32px]">サービス内容</h2>
          </motion.div>
          
          <motion.div 
            className="flex flex-col gap-[8vw] lg:space-y-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, threshold: 0.1 }}
            variants={staggerContainer}
          >
            {/* Service 1: Chat Consultation */}
            <motion.div 
              className="grid lg:grid-cols-2 gap-[4vw] sm:gap-8 items-center"
              variants={fadeInUp}
            >
              <motion.div 
                className="order-2 lg:order-1"
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center flex-wrap gap-[2vw] sm:gap-4 mb-[3vw] sm:mb-6">
                  <motion.div 
                    className="text-[6vw] sm:text-3xl lg:text-4xl text-gray-600 min-text-[24px] max-text-[32px]"
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.3 }}
                  >
                    01
                  </motion.div>
                  <div className="w-[8vw] h-[8vw] min-w-[32px] max-w-[48px] min-h-[32px] max-h-[48px] sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gray-100 rounded-full flex items-center justify-center">
                    <MessageCircle className="w-[4vw] h-[4vw] min-w-[16px] max-w-[24px] min-h-[16px] max-h-[24px] sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-gray-600" />
                  </div>
                  <h3 className="text-[4.5vw] sm:text-xl lg:text-2xl min-text-[18px] max-text-[20px] flex-1 min-w-[120px]">チャットで気軽に税務相談</h3>
                </div>
                <p className="text-[4vw] sm:text-lg text-gray-700 leading-relaxed min-text-[16px] max-text-[18px]">
                  「これって経費になる？」といった素朴な疑問をいつでも気軽に相談できます。もう一人で悩む必要はありません。
                </p>
              </motion.div>
              <motion.div 
                className="order-1 lg:order-2 bg-white p-[3vw] sm:p-6 rounded-xl shadow-lg"
                whileHover={{ scale: 1.02 }}
              >
                <div className="aspect-square rounded-lg overflow-hidden">
                  <img 
                    src={consultationTypingImage} 
                    alt="パソコンでタイピングしているイメージ - チャット相談" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </motion.div>
            </motion.div>

            {/* Service 2: Bookkeeping */}
            <motion.div 
              className="grid lg:grid-cols-2 gap-[4vw] sm:gap-8 items-center"
              variants={fadeInUp}
            >
              <motion.div 
                className="bg-white p-[3vw] sm:p-6 rounded-xl shadow-lg"
                whileHover={{ scale: 1.02 }}
              >
                <div className="aspect-square rounded-lg overflow-hidden">
                  <img 
                    src={bookkeepingImage} 
                    alt="書類を確認しながらパソコンで記帳作業を行う様子" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }}>
                <div className="flex items-center flex-wrap gap-[2vw] sm:gap-4 mb-[3vw] sm:mb-6">
                  <motion.div 
                    className="text-[6vw] sm:text-3xl lg:text-4xl text-gray-600 min-text-[24px] max-text-[32px]"
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.3 }}
                  >
                    02
                  </motion.div>
                  <div className="w-[8vw] h-[8vw] min-w-[32px] max-w-[48px] min-h-[32px] max-h-[48px] sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gray-100 rounded-full flex items-center justify-center">
                    <BookOpen className="w-[4vw] h-[4vw] min-w-[16px] max-w-[24px] min-h-[16px] max-h-[24px] sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-gray-600" />
                  </div>
                  <h3 className="text-[4.5vw] sm:text-xl lg:text-2xl min-text-[18px] max-text-[20px] flex-1 min-w-[120px]">記帳も丸投げでOK</h3>
                </div>
                <p className="text-[4vw] sm:text-lg text-gray-700 leading-relaxed min-text-[16px] max-text-[18px]">
                  お客さまは領収書やレシートをフォルダに保存いただくだけで大丈夫です。会計ソフトへの仕訳入力はすべて当社で行います。マネーフォワードかfreeeをご利用いただきます。
                </p>
              </motion.div>
            </motion.div>

            {/* Service 3: Tax Return Support */}
            <motion.div 
              className="grid lg:grid-cols-2 gap-[4vw] sm:gap-8 items-center"
              variants={fadeInUp}
            >
              <motion.div 
                className="order-2 lg:order-1"
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center flex-wrap gap-[2vw] sm:gap-4 mb-[3vw] sm:mb-6">
                  <motion.div 
                    className="text-[6vw] sm:text-3xl lg:text-4xl text-gray-600 min-text-[24px] max-text-[32px]"
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.3 }}
                  >
                    03
                  </motion.div>
                  <div className="w-[8vw] h-[8vw] min-w-[32px] max-w-[48px] min-h-[32px] max-h-[48px] sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gray-100 rounded-full flex items-center justify-center">
                    <FileCheck className="w-[4vw] h-[4vw] min-w-[16px] max-w-[24px] min-h-[16px] max-h-[24px] sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-gray-600" />
                  </div>
                  <h3 className="text-[4.5vw] sm:text-xl lg:text-2xl min-text-[18px] max-text-[20px] flex-1 min-w-[120px]">安心の確定申告サポート</h3>
                </div>
                <p className="text-[4vw] sm:text-lg text-gray-700 leading-relaxed min-text-[16px] max-text-[18px]">
                  複雑で分かりにくい確定申告も、税理士が責任をもって作成＆申告を行います。
                </p>
              </motion.div>
              <motion.div 
                className="order-1 lg:order-2 bg-white p-[3vw] sm:p-6 rounded-xl shadow-lg"
                whileHover={{ scale: 1.02 }}
              >
                <div className="aspect-square rounded-lg overflow-hidden">
                  <img 
                    src={taxReturnImage} 
                    alt="確定申告書類" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </motion.div>
            </motion.div>

            {/* Service 4: Financial Reports */}
            <motion.div 
              className="grid lg:grid-cols-2 gap-[4vw] sm:gap-8 items-center"
              variants={fadeInUp}
            >
              <motion.div 
                className="bg-white p-[3vw] sm:p-6 rounded-xl shadow-lg"
                whileHover={{ scale: 1.02 }}
              >
                <div className="aspect-square rounded-lg overflow-hidden">
                  <img 
                    src={financialReportImage} 
                    alt="財務分析資料とグラフ - 財務レポート" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }}>
                <div className="flex items-center flex-wrap gap-[2vw] sm:gap-4 mb-[3vw] sm:mb-6">
                  <motion.div 
                    className="text-[6vw] sm:text-3xl lg:text-4xl text-gray-600 min-text-[24px] max-text-[32px]"
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.3 }}
                  >
                    04
                  </motion.div>
                  <div className="w-[8vw] h-[8vw] min-w-[32px] max-w-[48px] min-h-[32px] max-h-[48px] sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gray-100 rounded-full flex items-center justify-center">
                    <BarChart3 className="w-[4vw] h-[4vw] min-w-[16px] max-w-[24px] min-h-[16px] max-h-[24px] sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-gray-600" />
                  </div>
                  <h3 className="text-[4.5vw] sm:text-xl lg:text-2xl min-text-[18px] max-text-[20px] flex-1 min-w-[120px]">財務レポートの提出</h3>
                </div>
                <p className="text-[4vw] sm:text-lg text-gray-700 leading-relaxed min-text-[16px] max-text-[18px]">
                  毎月の財務状況をレポート形式で提出します。直近の財務状況の課題を踏まえアドバイスを提供します。
                </p>
              </motion.div>
            </motion.div>

            {/* Service 5: Tax and Cash Flow Information */}
            <motion.div 
              className="grid lg:grid-cols-2 gap-[4vw] sm:gap-8 items-center"
              variants={fadeInUp}
            >
              <motion.div 
                className="order-2 lg:order-1"
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center flex-wrap gap-[2vw] sm:gap-4 mb-[3vw] sm:mb-6">
                  <motion.div 
                    className="text-[6vw] sm:text-3xl lg:text-4xl text-gray-600 min-text-[24px] max-text-[32px]"
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.3 }}
                  >
                    05
                  </motion.div>
                  <div className="w-[8vw] h-[8vw] min-w-[32px] max-w-[48px] min-h-[32px] max-h-[48px] sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gray-100 rounded-full flex items-center justify-center">
                    <TrendingDown className="w-[4vw] h-[4vw] min-w-[16px] max-w-[24px] min-h-[16px] max-h-[24px] sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-gray-600" />
                  </div>
                  <h3 className="text-[4.5vw] sm:text-xl lg:text-2xl min-text-[18px] max-text-[20px] flex-1 min-w-[200px]">節税・資金繰りに関する情報提供</h3>
                </div>
                <p className="text-[4vw] sm:text-lg text-gray-700 leading-relaxed min-text-[16px] max-text-[18px]">
                  知っておくべき財務や税務の基礎知識を分かりやすくお伝えし、健全なキャッシュフローの維持をサポートします。
                </p>
              </motion.div>
              <motion.div 
                className="order-1 lg:order-2 bg-white p-[3vw] sm:p-6 rounded-xl shadow-lg"
                whileHover={{ scale: 1.02 }}
              >
                <div className="aspect-square rounded-lg overflow-hidden">
                  <img 
                    src={taxInfoImage} 
                    alt="TAXの3D文字と電卓 - 節税・資金繰り情報" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="plans" className="py-[8vw] sm:py-16 lg:py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-[4vw] sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-[8vw] sm:mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, threshold: 0.1 }}
            variants={fadeInUp}
          >
            <h2 className="text-[6vw] sm:text-3xl lg:text-4xl mb-4 min-text-[24px] max-text-[32px]">みんなの税務顧問</h2>
            <p className="text-[4vw] sm:text-xl text-gray-600 min-text-[16px] max-text-[20px]">年商1,000万円以下の事業者に特化した税務顧問サービス</p>
          </motion.div>
          
          <motion.div 
            className="max-w-3xl mx-auto"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, threshold: 0.1 }}
            variants={scaleIn}
          >
            <Card className="bg-white shadow-lg border-2 border-gray-200">
              <CardHeader className="text-center bg-gray-700 text-white rounded-t-lg">
                <div className="py-[3vw] sm:py-4">
                  <Badge className="bg-yellow-500 text-black mb-[2vw] sm:mb-4">超低価格</Badge>
                  <div className="text-[8vw] sm:text-4xl lg:text-5xl mb-2 min-text-[32px] max-text-[40px]">
                    <span>¥980</span>
                    <span className="text-[3vw] sm:text-base lg:text-lg opacity-80 min-text-[12px] max-text-[16px]">/月</span>
                  </div>
                  <p className="text-blue-100 text-[3vw] sm:text-base min-text-[12px] max-text-[16px]">（2年目以降は4,980円）</p>
                </div>
              </CardHeader>

              <CardContent className="p-[3vw] sm:p-6 lg:p-8">
                {/* Price Table */}
                <div className="mb-[4vw] sm:mb-8">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[300px]">
                      <thead>
                        <tr className="border-b-2 border-gray-200">
                          <th className="text-left py-3 text-[4vw] sm:text-lg min-text-[14px] max-text-[16px]">サービス内容</th>
                          <th className="text-right py-3 text-[4vw] sm:text-lg min-text-[14px] max-text-[16px]">料金</th>
                        </tr>
                      </thead>
                      <tbody className="text-[3.5vw] sm:text-base min-text-[12px] max-text-[14px]">
                        <tr className="border-b border-gray-100">
                          <td className="py-3 sm:py-4">月額顧問料</td>
                          <td className="py-3 sm:py-4 text-right">
                            <span className="text-gray-700 text-[4.5vw] sm:text-xl min-text-[16px] max-text-[18px]">¥980</span>
                          </td>
                        </tr>
                        <tr className="border-b border-gray-100">
                          <td className="py-3 sm:py-4">記帳代行</td>
                          <td className="py-3 sm:py-4 text-right text-gray-700">¥2,980（100仕訳あたり）</td>
                        </tr>
                        <tr className="border-b border-gray-100">
                          <td className="py-3 sm:py-4">申告料</td>
                          <td className="py-3 sm:py-4 text-right text-gray-700">¥49,800</td>
                        </tr>
                        <tr className="border-b border-gray-100">
                          <td className="py-3 sm:py-4">消費税申告（別途）</td>
                          <td className="py-3 sm:py-4 text-right text-gray-700">¥29,800</td>
                        </tr>
                        <tr className="border-b border-gray-100">
                          <td className="py-3 sm:py-4">会計システム料 <span className="text-[2.5vw] sm:text-sm text-gray-500 block sm:inline min-text-[10px] max-text-[12px]">（マネーフォワードかfreee）</span></td>
                          <td className="py-3 sm:py-4 text-right text-gray-700">¥980</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Annual cost highlight */}
                <motion.div 
                  className="bg-gray-700 text-white p-[3vw] sm:p-6 rounded-lg text-center mb-[3vw] sm:mb-6"
                  whileHover={{ scale: 1.02 }}
                >
                  <p className="text-[4vw] sm:text-lg mb-2 min-text-[14px] max-text-[16px]">年間料金目安</p>
                  <div className="text-[6vw] sm:text-3xl lg:text-4xl mb-2 min-text-[24px] max-text-[32px]">¥109,080〜</div>
                </motion.div>

                {/* Important notes */}
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-[2.5vw] sm:p-4 mb-[3vw] sm:mb-6">
                  <h4 className="text-yellow-800 mb-2 text-[3.5vw] sm:text-base min-text-[12px] max-text-[14px]">重要事項</h4>
                  <ul className="text-[3vw] sm:text-sm text-yellow-700 space-y-1 min-text-[10px] max-text-[12px]">
                    <li>• 2年間の契約解除はできません</li>
                    <li>• 年末調整、法定調書、償却資産税、税務届出は上記料金には含まれません</li>
                  </ul>
                </div>

                {/* CTA Button */}
                <motion.div 
                  whileHover={{ scale: 1.05 }} 
                  whileTap={{ scale: 0.95 }}
                  className="mt-[4vw] sm:mt-8"
                >
                  <Button
                    onClick={() => scrollToSection('contact')}
                    className="w-full bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white py-[3vw] min-h-[48px] sm:py-6 px-6 sm:px-8 text-[4vw] sm:text-xl font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform relative overflow-hidden min-text-[16px] max-text-[20px]"
                  >
                    <motion.span
                      animate={{ scale: [1, 1.02, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="relative z-10"
                    >
                      申し込む
                    </motion.span>
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"
                      animate={{ x: [-100, 400] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    />
                  </Button>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Cost Comparison Section */}
      <section id="cost-comparison" className="py-[8vw] sm:py-16 lg:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-[4vw] sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-[8vw] sm:mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, threshold: 0.1 }}
            variants={fadeInUp}
          >
            <h2 className="text-[6vw] sm:text-3xl lg:text-4xl mb-4 min-text-[24px] max-text-[32px]">コスト比較</h2>
          </motion.div>
          
          {/* Comparison Image */}
          <motion.div 
            className="text-center mb-[6vw] sm:mb-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, threshold: 0.1 }}
            variants={scaleIn}
          >
            <div className="max-w-5xl mx-auto aspect-[16/10] sm:aspect-auto">
              <img 
                src={costComparisonImage} 
                alt="他事務所との料金比較（年間）" 
                className="w-full h-full object-contain rounded-xl shadow-lg"
              />
            </div>
          </motion.div>
          
          {/* Detailed Comparison Cards */}
          <motion.div 
            className="grid lg:grid-cols-3 gap-[4vw] sm:gap-8 max-w-6xl mx-auto"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, threshold: 0.1 }}
            variants={staggerContainer}
          >
            {/* General Tax Advisor */}
            <motion.div variants={fadeInUp}>
              <Card className="h-full bg-white shadow-lg min-h-[300px]">
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-[4vw] sm:text-xl text-gray-800 min-text-[16px] max-text-[18px]">一般的な税理士事務所</CardTitle>
                  <div className="text-[6vw] sm:text-3xl text-gray-600 mt-4 min-text-[24px] max-text-[28px]">¥680,000</div>
                  <p className="text-gray-500 text-[3vw] sm:text-base min-text-[12px] max-text-[14px]">年間</p>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="flex flex-col gap-2 sm:space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-gray-100 text-[3vw] sm:text-base min-text-[12px] max-text-[14px]">
                      <span className="text-gray-700">月額顧問料</span>
                      <span className="text-gray-900">¥20,000</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100 text-[3vw] sm:text-base min-text-[12px] max-text-[14px]">
                      <span className="text-gray-700">記帳代行料</span>
                      <span className="text-gray-900">¥20,000</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100 text-[3vw] sm:text-base min-text-[12px] max-text-[14px]">
                      <span className="text-gray-700">申告料</span>
                      <span className="text-gray-900">¥150,000</span>
                    </div>
                    <div className="flex justify-between items-center py-2 text-[3vw] sm:text-base min-text-[12px] max-text-[14px]">
                      <span className="text-gray-700">会計システム料</span>
                      <span className="text-gray-900">¥50,000</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Budget Tax Advisor */}
            <motion.div variants={fadeInUp}>
              <Card className="h-full bg-white shadow-lg min-h-[300px]">
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-[4vw] sm:text-xl text-gray-800 min-text-[16px] max-text-[18px]">一般的な格安税理士事務所</CardTitle>
                  <div className="text-[6vw] sm:text-3xl text-gray-600 mt-4 min-text-[24px] max-text-[28px]">¥310,000</div>
                  <p className="text-gray-500 text-[3vw] sm:text-base min-text-[12px] max-text-[14px]">年間</p>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="flex flex-col gap-2 sm:space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-gray-100 text-[3vw] sm:text-base min-text-[12px] max-text-[14px]">
                      <span className="text-gray-700">月額顧問料</span>
                      <span className="text-gray-900">¥5,000</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100 text-[3vw] sm:text-base min-text-[12px] max-text-[14px]">
                      <span className="text-gray-700">記帳代行料</span>
                      <span className="text-gray-900">¥10,000</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100 text-[3vw] sm:text-base min-text-[12px] max-text-[14px]">
                      <span className="text-gray-700">申告料</span>
                      <span className="text-gray-900">¥80,000</span>
                    </div>
                    <div className="flex justify-between items-center py-2 text-[3vw] sm:text-base min-text-[12px] max-text-[14px]">
                      <span className="text-gray-700">会計システム料</span>
                      <span className="text-gray-900">¥50,000</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Our Service */}
            <motion.div variants={fadeInUp}>
              <Card className="h-full bg-gradient-to-br from-pink-50 to-purple-50 shadow-xl border-2 border-pink-200 min-h-[300px]">
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-[4vw] sm:text-xl text-gray-800 min-text-[16px] max-text-[18px]">みんなの税務顧問</CardTitle>
                  <div className="text-[6vw] sm:text-3xl lg:text-4xl text-pink-600 mt-4 min-text-[24px] max-text-[32px]">¥109,080</div>
                  <p className="text-gray-500 text-[3vw] sm:text-base min-text-[12px] max-text-[14px]">年間</p>
                  <Badge className="bg-pink-500 text-white mt-3 mx-auto">最安値</Badge>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="flex flex-col gap-2 sm:space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-pink-100 text-[3vw] sm:text-base min-text-[12px] max-text-[14px]">
                      <span className="text-gray-700">月額顧問料</span>
                      <span className="text-pink-600 font-bold">¥980</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-pink-100 text-[3vw] sm:text-base min-text-[12px] max-text-[14px]">
                      <span className="text-gray-700">記帳代行料</span>
                      <span className="text-gray-900">¥2,980</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-pink-100 text-[3vw] sm:text-base min-text-[12px] max-text-[14px]">
                      <span className="text-gray-700">申告料</span>
                      <span className="text-gray-900">¥49,800</span>
                    </div>
                    <div className="flex justify-between items-center py-2 text-[3vw] sm:text-base min-text-[12px] max-text-[14px]">
                      <span className="text-gray-700">会計システム料</span>
                      <span className="text-gray-900">¥980</span>
                    </div>
                  </div>
                  <div className="mt-[3vw] sm:mt-6 p-3 bg-gray-50 rounded-lg">
                    <p className="text-gray-700 text-[2.5vw] sm:text-sm min-text-[10px] max-text-[12px]">
                      ※会計システム料980円で<br />
                      マネーフォワードかfreeeをご利用いただけます
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-[8vw] sm:py-16 lg:py-20 bg-gradient-to-br from-gray-700 to-gray-800 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute bg-white rounded-full opacity-10"
              style={{
                width: `${40 + i * 10}px`,
                height: `${40 + i * 10}px`,
                top: `${15 + i * 12}%`,
                left: `${5 + i * 15}%`,
              }}
              animate={{
                y: [0, -15, 0],
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 4 + i * 0.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={`right_${i}`}
              className="absolute bg-white rounded-full opacity-10"
              style={{
                width: `${35 + i * 8}px`,
                height: `${35 + i * 8}px`,
                top: `${20 + i * 10}%`,
                right: `${5 + i * 12}%`,
              }}
              animate={{
                y: [0, 15, 0],
                scale: [1, 1.08, 1],
              }}
              transition={{
                duration: 3.5 + i * 0.4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
        
        <div className="max-w-7xl mx-auto px-[4vw] sm:px-6 lg:px-8 relative z-10">
          <motion.div 
            className="text-center mb-[8vw] sm:mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, threshold: 0.1 }}
            variants={fadeInUp}
          >
            <div className="flex items-center justify-center mb-[3vw] sm:mb-6">
              <motion.div 
                className="w-[10vw] h-[10vw] min-w-[48px] max-w-[64px] min-h-[48px] max-h-[64px] sm:w-16 sm:h-16 bg-white bg-opacity-10 rounded-full flex items-center justify-center mr-4 p-2 sm:p-3"
                whileHover={{ scale: 1.1, rotate: 360 }}
                transition={{ duration: 0.3 }}
              >
                <img 
                  src={logoIcon} 
                  alt="みんなの税務顧問ロゴ" 
                  className="w-full h-full object-contain"
                />
              </motion.div>
            </div>
            <h2 className="text-[6vw] sm:text-3xl lg:text-4xl text-white mb-[4vw] sm:mb-8 font-bold min-text-[24px] max-text-[32px]">「みんなの税務顧問」の申込</h2>
            <p className="text-white text-[4vw] sm:text-lg lg:text-xl font-medium mb-[4vw] sm:mb-8 min-text-[16px] max-text-[20px]">
              確認されましたら以下の□にチェックを入れてください。
            </p>
          </motion.div>
          
          {/* Common Terms Agreement Section */}
          <motion.div 
            className="max-w-4xl mx-auto mb-[6vw] sm:mb-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, threshold: 0.1 }}
            variants={fadeInUp}
          >
            <motion.div 
              className="bg-white bg-opacity-95 backdrop-blur-sm rounded-2xl p-[3vw] sm:p-6 lg:p-8 shadow-lg"
              variants={scaleIn}
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-start gap-[2vw] sm:space-x-4">
                <Checkbox
                  id="terms-agreement"
                  checked={isTermsAgreed}
                  onCheckedChange={(checked) => setIsTermsAgreed(checked as boolean)}
                  className="mt-1 h-[4vw] w-[4vw] min-h-[20px] max-h-[24px] min-w-[20px] max-w-[24px] sm:h-6 sm:w-6 border-2 border-gray-600 data-[state=checked]:bg-gray-600 data-[state=checked]:text-white flex-shrink-0"
                />
                <label 
                  htmlFor="terms-agreement" 
                  className="text-gray-800 text-[3.5vw] sm:text-lg leading-relaxed cursor-pointer font-medium min-text-[14px] max-text-[18px]"
                >
                  「みんなの税務顧問」のサービス内容、
                  <a 
                    href="#" 
                    className="text-blue-600 underline hover:text-blue-800 transition-colors"
                    onClick={(e) => {
                      e.preventDefault();
                      // 利用規約ページを開く処理をここに追加
                      alert('利用規約ページを開きます');
                    }}
                  >
                    利用規約
                  </a>
                  を確認したので、申込をします。
                </label>
              </div>
            </motion.div>
          </motion.div>
          
          {/* Two Column Application Forms */}
          <motion.div 
            className="grid lg:grid-cols-2 gap-[4vw] sm:gap-8 max-w-6xl mx-auto"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, threshold: 0.1 }}
            variants={staggerContainer}
          >
            {/* Left Column: No Consumption Tax */}
            <motion.div 
              className="bg-white bg-opacity-95 backdrop-blur-sm rounded-2xl p-[3vw] sm:p-6 lg:p-8 shadow-lg"
              variants={fadeInLeft}
              whileHover={{ scale: 1.02 }}
            >
              <div className="text-center mb-[3vw] sm:mb-6">
                <div className="w-[8vw] h-[8vw] min-w-[40px] max-w-[48px] min-h-[40px] max-h-[48px] sm:w-12 sm:h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-[4vw] h-[4vw] min-w-[20px] max-w-[24px] min-h-[20px] max-h-[24px] sm:w-6 sm:h-6 text-white" />
                </div>
                <h3 className="text-[4.5vw] sm:text-xl lg:text-2xl text-gray-800 mb-4 font-bold min-text-[18px] max-text-[22px]">消費税の申告をしない方</h3>
              </div>
              
              <div className="text-center">
                <motion.div 
                  whileHover={{ scale: 1.05 }} 
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    onClick={handleApplicationSubmitNoTax}
                    size="lg"
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-[3vw] min-h-[48px] sm:py-5 lg:py-6 px-6 sm:px-8 text-[4vw] sm:text-xl font-bold rounded-full shadow-lg min-text-[16px] max-text-[20px]"
                    disabled={!isTermsAgreed}
                  >
                    申し込む
                  </Button>
                </motion.div>
                
                {!isTermsAgreed && (
                  <motion.div
                    className="bg-red-100 border-l-4 border-red-400 p-[2vw] sm:p-4 rounded-r-lg mt-4"
                    animate={{ opacity: [0.9, 1, 0.9] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <p className="text-red-800 text-[3vw] sm:text-sm font-medium min-text-[10px] max-text-[12px]">
                      利用規約への同意が必要です
                    </p>
                  </motion.div>
                )}
              </div>
            </motion.div>

            {/* Right Column: With Consumption Tax */}
            <motion.div 
              className="bg-white bg-opacity-95 backdrop-blur-sm rounded-2xl p-[3vw] sm:p-6 lg:p-8 shadow-lg"
              variants={fadeInRight}
              whileHover={{ scale: 1.02 }}
            >
              <div className="text-center mb-[3vw] sm:mb-6">
                <div className="w-[8vw] h-[8vw] min-w-[40px] max-w-[48px] min-h-[40px] max-h-[48px] sm:w-12 sm:h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileCheck className="w-[4vw] h-[4vw] min-w-[20px] max-w-[24px] min-h-[20px] max-h-[24px] sm:w-6 sm:h-6 text-white" />
                </div>
                <h3 className="text-[4.5vw] sm:text-xl lg:text-2xl text-gray-800 mb-4 font-bold min-text-[18px] max-text-[22px]">消費税の申告（還付）をする方</h3>
              </div>
              
              <div className="text-center">
                <motion.div 
                  whileHover={{ scale: 1.05 }} 
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    onClick={handleApplicationSubmitWithTax}
                    size="lg"
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-[3vw] min-h-[48px] sm:py-5 lg:py-6 px-6 sm:px-8 text-[4vw] sm:text-xl font-bold rounded-full shadow-lg min-text-[16px] max-text-[20px]"
                    disabled={!isTermsAgreed}
                  >
                    申し込む
                  </Button>
                </motion.div>
                
                {!isTermsAgreed && (
                  <motion.div
                    className="bg-red-100 border-l-4 border-red-400 p-[2vw] sm:p-4 rounded-r-lg mt-4"
                    animate={{ opacity: [0.9, 1, 0.9] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <p className="text-red-800 text-[3vw] sm:text-sm font-medium mb-2 min-text-[10px] max-text-[12px]">
                      利用規約への同意が必要です
                    </p>
                    <p className="text-yellow-800 text-[3vw] sm:text-sm font-medium min-text-[10px] max-text-[12px]">
                      インボイス登録をされている方は、こちらを選択してください。
                    </p>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-[4vw] sm:py-8 bg-white border-t border-gray-300">
        <div className="max-w-7xl mx-auto px-[4vw] sm:px-6 lg:px-8">
          <div className="text-center flex flex-col gap-2">
            <p className="text-gray-600 text-[3.5vw] sm:text-base min-text-[12px] max-text-[14px]">
              運営　
              <a 
                href="https://www.solvis-tax.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline transition-colors"
              >
                ソルビス税理士法人
              </a>
            </p>
            <p className="text-gray-500 text-[3vw] sm:text-sm min-text-[10px] max-text-[12px]">
              Copyright ©みんなの税務顧問. All rights reserved
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
interface SectionProps {
    title: string;
    children: React.ReactNode;
  }
  
  const Section: React.FC<SectionProps> = ({ title, children }) => (
    <div className="bg-gray-50 rounded-lg p-4 mb-4">
      <h4 className="text-xss font-semibold text-orange-700 mb-2">{title}</h4>
      <div className="space-y-4">{children}</div>
    </div>
  );

  export default Section;
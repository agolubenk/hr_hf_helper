import CommandCenter from '../components/CommandCenter';
import StatWidgets from '../components/StatWidgets';
import ModuleGrid from '../components/ModuleGrid';

const HomePage: React.FC = () => {
  return (
    <div className="home-page">
      <CommandCenter />
      <StatWidgets />
      <ModuleGrid />
    </div>
  );
};

export default HomePage;
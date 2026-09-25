import { DocumentChartBarIcon } from '@heroicons/react/24/outline';
import { Navbar as FlowbiteNavbar, NavbarBrand } from 'flowbite-react';

export default function Navbar() {
  return (
    <FlowbiteNavbar
      fluid
      rounded
      className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
    >
      <NavbarBrand href="#">
        <DocumentChartBarIcon className="mr-3 h-6 w-6 text-cyan-600 dark:text-cyan-400" />
        <span className="self-center whitespace-nowrap text-xl font-semibold dark:text-white">
          ExcelSheet Matcher
        </span>
      </NavbarBrand>
    </FlowbiteNavbar>
  );
}
